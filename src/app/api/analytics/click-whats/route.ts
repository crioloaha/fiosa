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
        cliquesWhats: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar clique de WhatsApp:', error);
    return NextResponse.json({ error: 'Erro ao registrar clique.' }, { status: 500 });
  }
}
