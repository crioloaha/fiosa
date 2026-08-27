import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlLength = process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0;
  const dbUrlProtocol = process.env.DATABASE_URL ? process.env.DATABASE_URL.split(':')[0] : 'none';
  const hasJwtSecret = !!process.env.JWT_SECRET;

  const diagnostics = {
    env: {
      hasDbUrl,
      dbUrlLength,
      dbUrlProtocol,
      hasJwtSecret,
      NODE_ENV: process.env.NODE_ENV,
    },
    dbConnection: 'testing...',
    error: null as any,
  };

  try {
    await prisma.$connect();
    const count = await prisma.artesao.count();
    diagnostics.dbConnection = `success! Count of artisans: ${count}`;
  } catch (err: any) {
    diagnostics.dbConnection = 'failed';
    diagnostics.error = {
      message: err.message,
      code: err.code,
      meta: err.meta,
    };
  }

  return NextResponse.json(diagnostics);
}
