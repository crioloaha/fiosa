import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout efetuado com sucesso.' });
  response.cookies.delete('token');
  return response;
}
