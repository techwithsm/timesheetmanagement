import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Timesheet & Attendance API',
      version: '1.0.0',
      description: 'API for managing school attendance and timesheets',
      contact: { name: 'School IT Team', email: 'it@school.edu' },
    },
    servers: [
      { url: 'http://localhost:3001/api/v1', description: 'Development' },
      { url: 'https://api.school.edu/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.ts', './src/modules/**/*.yaml'],
};

export const swaggerSpec = swaggerJsdoc(options);
