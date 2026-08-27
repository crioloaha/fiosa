import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

async function getSession(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

// DELETE: Remove a registered sale
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;

    const venda = await prisma.venda.findUnique({
      where: { id },
    });

    if (!venda) {
      return NextResponse.json({ error: 'Venda não encontrada.' }, { status: 404 });
    }

    // Check permission: Admin or owning Artisan
    if (session.tipo !== 'ADMIN' && venda.artesaoId !== session.artesaoId) {
      return NextResponse.json({ error: 'Não autorizado a excluir esta venda.' }, { status: 403 });
    }

    await prisma.venda.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Venda excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir venda:', error);
    return NextResponse.json({ error: 'Erro ao excluir venda.' }, { status: 500 });
  }
}
