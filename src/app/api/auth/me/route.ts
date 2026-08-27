import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Refresh user data from db to make sure it's up to date
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        status: true,
        artesao: {
          select: {
            id: true,
            nome: true,
            slug: true,
            marca: true,
            foto: true,
            capa: true,
            whatsapp: true,
            instagram: true,
            emailContato: true,
          },
        },
      },
    });

    if (!usuario || usuario.status !== 'ATIVO') {
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        artesao: usuario.artesao,
      },
    });
  } catch (error) {
    console.error('Erro na API /api/auth/me:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
