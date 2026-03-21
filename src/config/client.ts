import * as dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const adapter = new PrismaPg({ connectionString: DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export default prisma;