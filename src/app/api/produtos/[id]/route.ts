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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const where: any = isUUID(id) ? { id } : { slug: id };

    const produto = await prisma.produto.findFirst({
      where,
      include: {
        artesao: true,
        categoria: true,
      },
    });

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar produto.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: { artesao: true },
    });

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    if (session.tipo !== 'ADMIN' && produto.artesaoId !== session.artesaoId) {
      return NextResponse.json({ error: 'Não autorizado a editar este produto.' }, { status: 403 });
    }

    const {
      nome,
      categoriaId,
      descricao,
      preco,
      custo,
      fotos,
      materiais,
      tecnica,
      dimensoes,
      peso,
      disponibilidade,
      status,
      codigo,
      tags,
    } = body;

    let slug = produto.slug;
    if (nome && nome !== produto.nome) {
      const baseSlug = slugify(nome);
      slug = baseSlug;
      let counter = 1;
      while (await prisma.produto.findFirst({ where: { slug, id: { not: id } } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updated = await prisma.produto.update({
      where: { id },
      data: {
        nome: nome ?? produto.nome,
        categoriaId: categoriaId ?? produto.categoriaId,
        slug,
        descricao: descricao !== undefined ? descricao : produto.descricao,
        preco: preco !== undefined ? (preco ? parseFloat(preco) : null) : produto.preco,
        custo: custo !== undefined ? (custo ? parseFloat(custo) : null) : produto.custo,
        fotos: fotos ? JSON.stringify(fotos) : produto.fotos,
        materiais: materiais !== undefined ? materiais : produto.materiais,
        tecnica: tecnica !== undefined ? tecnica : produto.tecnica,
        dimensoes: dimensoes !== undefined ? dimensoes : produto.dimensoes,
        peso: peso !== undefined ? (peso ? parseFloat(peso) : null) : produto.peso,
        disponibilidade: disponibilidade ?? produto.disponibilidade,
        status: status ?? produto.status,
        codigo: codigo !== undefined ? codigo : produto.codigo,
        tags: tags !== undefined ? tags : produto.tags,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

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

    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    if (session.tipo !== 'ADMIN' && produto.artesaoId !== session.artesaoId) {
      return NextResponse.json({ error: 'Não autorizado a excluir este produto.' }, { status: 403 });
    }

    await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Produto excluído.' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;

    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    if (session.tipo !== 'ADMIN' && produto.artesaoId !== session.artesaoId) {
      return NextResponse.json({ error: 'Não autorizado a duplicar este produto.' }, { status: 403 });
    }

    const newName = `Cópia de ${produto.nome}`;
    const baseSlug = slugify(newName);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.produto.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const duplicated = await prisma.produto.create({
      data: {
        artesaoId: produto.artesaoId,
        categoriaId: produto.categoriaId,
        nome: newName,
        slug,
        descricao: produto.descricao,
        preco: produto.preco,
        custo: produto.custo,
        fotos: produto.fotos,
        materiais: produto.materiais,
        tecnica: produto.tecnica,
        dimensoes: produto.dimensoes,
        peso: produto.peso,
        disponibilidade: produto.disponibilidade,
        status: 'RASCUNHO',
        codigo: produto.codigo ? `${produto.codigo}-COPY` : null,
        tags: produto.tags,
      },
    });

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    console.error('Erro ao duplicar produto:', error);
    return NextResponse.json({ error: 'Erro ao duplicar produto.' }, { status: 500 });
  }
}
