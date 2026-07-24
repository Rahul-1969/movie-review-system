import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Review API',
      version: '1.0.0',
      description:
        'Full-stack MERN Movie Review System API — JWT auth, Redis caching, BullMQ email queue, Cloudinary uploads.',
      contact: {
        name: 'Movie Review Team',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://movie-review-api-sx0j.onrender.com'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production'
          ? 'Production server (Render)'
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            isActive: { type: 'boolean' },
            avatar: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                public_id: { type: 'string' },
              },
            },
          },
        },
        Movie: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            releaseYear: { type: 'integer' },
            language: { type: 'string' },
            averageRating: { type: 'number' },
            totalReviews: { type: 'integer' },
            isPublished: { type: 'boolean' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            rating: { type: 'integer' },
            comment: { type: 'string' },
            isFlagged: { type: 'boolean' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                pages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
