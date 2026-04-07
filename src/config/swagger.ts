import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RH API',
      version: '1.0.0',
      description: 'API interna para sistema de gestão de talentos e RH',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      schemas: {
        // ─── User ──────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            name:      { type: 'string' },
            email:     { type: 'string', format: 'email' },
            role:      { type: 'string', enum: ['ADMIN', 'RECRUITER', 'VIEWER'], nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUserDTO: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name:  { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
        },

        // ─── Department ────────────────────────────────────────
        Department: {
          type: 'object',
          properties: {
            id:   { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
        CreateDepartmentDTO: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
          },
        },

        // ─── Candidate ─────────────────────────────────────────
        Candidate: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            fullName:  { type: 'string' },
            email:     { type: 'string', format: 'email' },
            phone:     { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCandidateDTO: {
          type: 'object',
          required: ['fullName', 'email'],
          properties: {
            fullName: { type: 'string' },
            email:    { type: 'string', format: 'email' },
            phone:    { type: 'string' },
          },
        },

        // ─── Resume ────────────────────────────────────────────
        CreateResumeDTO: {
          type: 'object',
          properties: {
            summary:  { type: 'string' },
            fileUrl:  { type: 'string' },
            skillIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
            experiences: {
              type: 'array',
              items: {
                type: 'object',
                required: ['companyName', 'jobTitle', 'startDate'],
                properties: {
                  companyName: { type: 'string' },
                  jobTitle:    { type: 'string' },
                  startDate:   { type: 'string', format: 'date' },
                  endDate:     { type: 'string', format: 'date', nullable: true },
                  isCurrent:   { type: 'boolean' },
                  description: { type: 'string', nullable: true },
                },
              },
            },
            educations: {
              type: 'array',
              items: {
                type: 'object',
                required: ['institution', 'degree', 'startDate'],
                properties: {
                  institution:  { type: 'string' },
                  degree:       { type: 'string' },
                  fieldOfStudy: { type: 'string', nullable: true },
                  startDate:    { type: 'string', format: 'date' },
                  endDate:      { type: 'string', format: 'date', nullable: true },
                },
              },
            },
          },
        },

        // ─── JobPosition ───────────────────────────────────────
        JobPosition: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            title:       { type: 'string' },
            description: { type: 'string', nullable: true },
            status:      { type: 'string', enum: ['OPEN', 'CLOSED', 'PAUSED'] },
            createdAt:   { type: 'string', format: 'date-time' },
            department:  { $ref: '#/components/schemas/Department' },
          },
        },
        CreateJobPositionDTO: {
          type: 'object',
          required: ['title', 'departmentId'],
          properties: {
            title:        { type: 'string' },
            description:  { type: 'string' },
            departmentId: { type: 'string', format: 'uuid' },
          },
        },

        // ─── JobApplication ────────────────────────────────────
        JobApplication: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            currentStage: {
              type: 'string',
              enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'],
            },
            appliedAt:  { type: 'string', format: 'date-time' },
            candidate:  { $ref: '#/components/schemas/Candidate' },
            position:   { $ref: '#/components/schemas/JobPosition' },
          },
        },

        // ─── InternalNote ──────────────────────────────────────
        InternalNote: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            content:   { type: 'string' },
            rating:    { type: 'integer', minimum: 1, maximum: 5, nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            author:    { $ref: '#/components/schemas/User' },
          },
        },

        // ─── Error ─────────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  },
  RegisterDTO: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name:     { type: 'string' },
      email:    { type: 'string', format: 'email' },
      password: { type: 'string', format: 'password' },
    },
  },
  LoginDTO: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email:    { type: 'string', format: 'email' },
      password: { type: 'string', format: 'password' },
    },
  },
  AuthResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      user: { $ref: '#/components/schemas/User' },
    },
  },
  RefreshToken: {
    type: 'object',
    properties: {
      id:        { type: 'string', format: 'uuid' },
      token:     { type: 'string' },
      expiresAt: { type: 'string', format: 'date-time' },
      userId:    { type: 'string', format: 'uuid' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export default swaggerJsdoc(options);