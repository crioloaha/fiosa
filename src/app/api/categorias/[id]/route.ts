import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

async function getSession(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// PUT: Update category (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || session.tipo !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nome, descricao, imagem, percentualFiosa, status } = body;

    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
    }

    let slug = categoria.slug;
    if (nome && nome !== categoria.nome) {
      slug = slugify(nome);
      // Check uniqueness
      const exists = await prisma.categoria.findFirst({
        where: { slug, id: { not: id } },
      });
      if (exists) {
        return NextResponse.json({ error: 'Uma categoria com este nome já existe.' }, { status: 400 });
      }
    }

    const updated = await prisma.categoria.update({
      where: { id },
      data: {
        nome: nome ?? categoria.nome,
        slug,
        descricao: descricao !== undefined ? descricao : categoria.descricao,
        imagem: imagem !== undefined ? imagem : categoria.imagem,
        percentualFiosa: percentualFiosa !== undefined ? parseFloat(percentualFiosa) : categoria.percentualFiosa,
        status: status ?? categoria.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json({ error: 'Erro ao atualizar categoria.' }, { status: 500 });
  }
}

// DELETE: Delete category (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || session.tipo !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;

    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
    }

    // Check if there are products linked to this category
    const productsCount = await prisma.produto.count({
      where: { categoriaId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir esta categoria pois ela possui produtos associados.' },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Categoria excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json({ error: 'Erro ao excluir categoria.' }, { status: 500 });
  }
}
