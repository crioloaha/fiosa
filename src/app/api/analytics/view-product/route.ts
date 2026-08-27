import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório.' }, { status: 400 });
    }

    await prisma.produto.update({
      where: { id },
      data: {
        visualizacoes: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao incrementar visualizações do produto:', error);
    return NextResponse.json({ error: 'Erro ao registrar visualização.' }, { status: 500 });
  }
}
