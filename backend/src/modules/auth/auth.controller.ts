import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { successResponse } from '../../utils/response.util';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import * as authService from './auth.service';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    const result = await authService.loginUser(req.body, ipAddress, userAgent);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user) {
      await authService.logoutUser(req.user.userId);
    }
    res.clearCookie('refreshToken');
    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw new AppError('Refresh token required', HTTP_STATUS.UNAUTHORIZED);
    }
    const result = await authService.refreshAccessToken(refreshToken);
    successResponse(res, result, 'Token refreshed');
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.forgotPassword(req.body.email);
    successResponse(res, null, 'If the email exists, a reset link has been sent');
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    await authService.changePassword(req.user.userId, req.body);
    successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    const user = await authService.getMe(req.user.userId);
    successResponse(res, user, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
}
