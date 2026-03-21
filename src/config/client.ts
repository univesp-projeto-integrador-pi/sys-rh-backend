import * as dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL }
  }
});

export default prisma;