import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // 清除 userId cookie
  cookies().delete('userId');

  return NextResponse.json({ message: 'Logged out' });
}