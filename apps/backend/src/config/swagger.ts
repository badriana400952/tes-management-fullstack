import { env } from './env';

const BASE = '/api/v1';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description:
      'REST API for a task management application with JWT authentication (access token via HTTP-only cookie or Bearer header) and refresh-token rotation. All task endpoints are scoped to the authenticated user.',
    contact: {
      name: 'Backend Team',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      accessTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: env.ACCESS_COOKIE_NAME,
        description: 'HTTP-only cookie set after login / refresh.',
      },
      refreshTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: env.REFRESH_COOKIE_NAME,
        description: 'HTTP-only cookie holding the refresh token.',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            description: 'Optional structured error details.',
          },
          requestId: { type: 'string', example: 'c8d9e4f0-...' },
        },
      },
      UserProfile: {
        type: 'object',
        required: ['id', 'email', 'name', 'role', 'createdAt'],
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: { type: 'string', minLength: 8, maxLength: 72, example: 'password123' },
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'Alice' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      Task: {
        type: 'object',
        required: ['id', 'userId', 'title', 'status', 'priority', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          title: { type: 'string' },
          description: { type: ['string', 'null'] },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          dueDate: { type: ['string', 'null'], format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TaskCreateInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: ['string', 'null'], maxLength: 2000 },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          dueDate: { type: ['string', 'null'], format: 'date-time' },
        },
      },
      TaskUpdateInput: {
        type: 'object',
        description: 'At least one field must be provided.',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: ['string', 'null'], maxLength: 2000 },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          dueDate: { type: ['string', 'null'], format: 'date-time' },
        },
      },
      TaskStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
        },
      },
      Pagination: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrevious'],
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 25 },
          totalPages: { type: 'integer', example: 3 },
          hasNext: { type: 'boolean' },
          hasPrevious: { type: 'boolean' },
        },
      },
      TaskSummary: {
        type: 'object',
        required: ['TODO', 'IN_PROGRESS', 'DONE', 'total'],
        properties: {
          TODO: { type: 'integer' },
          IN_PROGRESS: { type: 'integer' },
          DONE: { type: 'integer' },
          total: { type: 'integer' },
        },
      },
      TaskListResult: {
        type: 'object',
        required: ['data', 'pagination', 'summary'],
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
          pagination: { $ref: '#/components/schemas/Pagination' },
          summary: { $ref: '#/components/schemas/TaskSummary' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
  paths: {
    [`${BASE}/auth/register`]: {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserProfile' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '409': { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    [`${BASE}/auth/login`]: {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive access & refresh cookies',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful (sets accessToken & refreshToken cookies)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserProfile' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '429': { description: 'Too many login attempts', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    [`${BASE}/auth/refresh-token`]: {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token and get a new token pair',
        description: `Requires the ${env.REFRESH_COOKIE_NAME} HTTP-only cookie. The previous refresh token is revoked.`,
        security: [],
        parameters: [
          {
            name: env.REFRESH_COOKIE_NAME,
            in: 'cookie',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'New token pair issued (cookies refreshed)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserProfile' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Missing or invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    [`${BASE}/auth/logout`]: {
      post: {
        tags: ['Auth'],
        summary: 'Revoke the refresh token and clear cookies',
        security: [],
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'null', example: null },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${BASE}/auth/me`]: {
      get: {
        tags: ['Auth'],
        summary: 'Get the currently authenticated user',
        security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
        responses: {
          '200': {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserProfile' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    [`${BASE}/tasks`]: {
      get: {
        tags: ['Tasks'],
        summary: 'List the authenticated user\'s tasks (paginated)',
        security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] } },
          { name: 'search', in: 'query', required: false, schema: { type: 'string' }, description: 'Search title & description (case-insensitive).' },
          { name: 'sortBy', in: 'query', required: false, schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'], default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', required: false, schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': {
            description: 'Paginated task list with statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskListResult' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid query parameters', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task for the authenticated user',
        security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskCreateInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    [`${BASE}/tasks/{id}`]: {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      get: {
        tags: ['Tasks'],
        summary: 'Get a single task owned by the user',
        security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
        responses: {
          '200': {
            description: 'Task found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Task not found (or belongs to another user)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update a task owned by the user',
        security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskUpdateInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Task updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { task: { $ref: '#/components/schemas/Task' } } } } } } } },
          '400': { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task owned by the user',
        security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
        responses: {
          '200': {
            description: 'Task deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'null', example: null },
                  },
                },
              },
            },
          },
          '401': { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    [`${BASE}/tasks/{id}/status`]: {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      patch: {
        tags: ['Tasks'],
        summary: 'Quickly update a task status',
        security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskStatusInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};