import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: 'Slug é obrigatório.' }, { status: 400 });
    }

    await prisma.artesao.update({
      where: { slug },
      data: {
        visualizacoesPerfil: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao incrementar visualizações do perfil:', error);
    return NextResponse.json({ error: 'Erro ao registrar visualização.' }, { status: 500 });
  }
}
