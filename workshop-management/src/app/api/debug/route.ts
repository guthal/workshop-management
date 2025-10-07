import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}