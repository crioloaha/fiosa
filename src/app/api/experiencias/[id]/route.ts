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

function isUUID(str: string) {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return pattern.test(str);
}

// GET: Retrieve single experience by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const where: any = isUUID(id) ? { id } : { slug: id };

    const experiencia = await prisma.experiencia.findFirst({
      where,
    });

    if (!experiencia) {
      return NextResponse.json({ error: 'Experiência não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(experiencia);
  } catch (error) {
    console.error('Erro ao buscar experiência:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar experiência.' }, { status: 500 });
  }
}

// PUT: Update experience (Admin only)
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
    const { titulo, descricao, imagem, localizacao, duracao, preco, contato, linkExterno, status } = body;

    const experiencia = await prisma.experiencia.findUnique({
      where: { id },
    });

    if (!experiencia) {
      return NextResponse.json({ error: 'Experiência não encontrada.' }, { status: 404 });
    }

    let slug = experiencia.slug;
    if (titulo && titulo !== experiencia.titulo) {
      slug = slugify(titulo);
      const exists = await prisma.experiencia.findFirst({
        where: { slug, id: { not: id } },
      });
      if (exists) {
        return NextResponse.json({ error: 'Uma experiência com este título já existe.' }, { status: 400 });
      }
    }

    const updated = await prisma.experiencia.update({
      where: { id },
      data: {
        titulo: titulo ?? experiencia.titulo,
        slug,
        descricao: descricao ?? experiencia.descricao,
        imagem: imagem !== undefined ? imagem : experiencia.imagem,
        localizacao: localizacao ?? experiencia.localizacao,
        duracao: duracao !== undefined ? duracao : experiencia.duracao,
        preco: preco !== undefined ? (preco ? parseFloat(preco) : null) : experiencia.preco,
        contato: contato !== undefined ? contato : experiencia.contato,
        linkExterno: linkExterno !== undefined ? linkExterno : experiencia.linkExterno,
        status: status ?? experiencia.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar experiência:', error);
    return NextResponse.json({ error: 'Erro ao atualizar experiência.' }, { status: 500 });
  }
}

// DELETE: Delete experience (Admin only)
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

    const experiencia = await prisma.experiencia.findUnique({
      where: { id },
    });

    if (!experiencia) {
      return NextResponse.json({ error: 'Experiência não encontrada.' }, { status: 404 });
    }

    await prisma.experiencia.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Experiência excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir experiência:', error);
    return NextResponse.json({ error: 'Erro ao excluir experiência.' }, { status: 500 });
  }
}
