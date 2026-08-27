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

// GET: List experiences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const adminMode = searchParams.get('admin') === 'true';

    let whereClause: any = {};
    if (!adminMode) {
      whereClause.status = 'ATIVO';
    }

    const experiencias = await prisma.experiencia.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(experiencias);
  } catch (error) {
    console.error('Erro ao buscar experiências:', error);
    return NextResponse.json({ error: 'Erro ao buscar experiências.' }, { status: 500 });
  }
}

// POST: Create experience (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.tipo !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, descricao, imagem, localizacao, duracao, preco, contato, linkExterno, status } = body;

    if (!titulo || !descricao || !localizacao) {
      return NextResponse.json(
        { error: 'Título, descrição e localização são obrigatórios.' },
        { status: 400 }
      );
    }

    const baseSlug = slugify(titulo);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.experiencia.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const experiencia = await prisma.experiencia.create({
      data: {
        titulo,
        slug,
        descricao,
        imagem: imagem || '',
        localizacao,
        duracao: duracao || '',
        preco: preco ? parseFloat(preco) : null,
        contato: contato || '',
        linkExterno: linkExterno || '',
        status: status || 'ATIVO',
      },
    });

    return NextResponse.json(experiencia, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar experiência:', error);
    return NextResponse.json({ error: 'Erro ao criar experiência.' }, { status: 500 });
  }
}
