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

// GET: List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const adminMode = searchParams.get('admin') === 'true';

    let whereClause: any = {};
    if (!adminMode) {
      whereClause.status = 'ATIVO';
    }

    const categorias = await prisma.categoria.findMany({
      where: whereClause,
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: 'Erro ao buscar categorias.' }, { status: 500 });
  }
}

// POST: Create category (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.tipo !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, descricao, imagem, percentualFiosa, status } = body;

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
    }

    const slug = slugify(nome);

    // Check uniqueness
    const exists = await prisma.categoria.findUnique({
      where: { slug },
    });
    if (exists) {
      return NextResponse.json({ error: 'Esta categoria já existe.' }, { status: 400 });
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        slug,
        descricao: descricao || '',
        imagem: imagem || '',
        percentualFiosa: percentualFiosa ? parseFloat(percentualFiosa) : 10.0,
        status: status || 'ATIVO',
      },
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ error: 'Erro ao criar categoria.' }, { status: 500 });
  }
}
