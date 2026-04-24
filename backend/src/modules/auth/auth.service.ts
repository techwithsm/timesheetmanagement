import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../config/jwt';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import { logger } from '../../config/logger';
import { sendEmail, buildPasswordResetEmail } from '../../utils/emailSender.util';
import type { LoginDTO, ChangePasswordDTO } from './auth.types';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30');

// Simple in-memory store for reset tokens (use Redis in production)
const resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

export async function loginUser(dto: LoginDTO, ipAddress: string, userAgent: string) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError(
      `Account locked. Try again in ${minutesLeft} minutes`,
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

  // Log attempt
  await prisma.loginAuditLog.create({
    data: { userId: user.id, success: passwordMatch, ipAddress, userAgent },
  });

  if (!passwordMatch) {
    const attempts = user.failedLoginAttempts + 1;
    const updateData: Record<string, unknown> = { failedLoginAttempts: attempts };

    if (attempts >= MAX_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
      updateData.failedLoginAttempts = 0;
      logger.warn(`Account locked: ${user.email}`);
    }

    await prisma.user.update({ where: { id: user.id }, data: updateData });
    throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
  }

  // Reset failed attempts on success
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user.id, tokenVersion: user.tokenVersion });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      schoolId: user.schoolId,
      avatarUrl: user.avatarUrl,
      mustChangePassword: user.mustChangePassword,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new AppError('Token has been revoked', HTTP_STATUS.UNAUTHORIZED);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    });

    return { accessToken };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
  }
}

export async function logoutUser(userId: string) {
  // Increment token version to invalidate all refresh tokens
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Don't reveal if email exists
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  resetTokens.set(token, { userId: user.id, expiresAt });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: buildPasswordResetEmail(resetLink, user.firstName),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  const record = resetTokens.get(token);
  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: record.userId },
    data: {
      passwordHash,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
      tokenVersion: { increment: 1 },
    },
  });

  resetTokens.delete(token);
}

export async function changePassword(userId: string, dto: ChangePasswordDTO) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  const match = await bcrypt.compare(dto.currentPassword, user.passwordHash);
  if (!match) throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);

  const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
      lastLoginAt: true,
      mustChangePassword: true,
      schoolId: true,
      school: { select: { id: true, name: true, logoUrl: true } },
    },
  });

  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  return user;
}
