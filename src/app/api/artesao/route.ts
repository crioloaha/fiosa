import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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

// GET: List all artisans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('busca') || undefined;
    const adminMode = searchParams.get('admin') === 'true';

    let whereClause: any = {};

    if (!adminMode) {
      whereClause.perfilAtivo = true;
    } else {
      const session = await getSession(request);
      if (!session || session.tipo !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado. Apenas admins.' }, { status: 401 });
      }
    }

    if (search) {
      whereClause.OR = [
        { nome: { contains: search } },
        { marca: { contains: search } },
        { bio: { contains: search } },
      ];
    }

    let includeObj: any = {
      usuario: {
        select: {
          email: true,
          status: true,
        },
      },
    };

    if (adminMode) {
      includeObj.vendas = {
        select: {
          valorVenda: true,
          contribuicaoFiosa: true,
        },
      };
    }

    const artesaos = await prisma.artesao.findMany({
      where: whereClause,
      include: includeObj,
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(artesaos);
  } catch (error) {
    console.error('Erro ao buscar artesãos:', error);
    return NextResponse.json({ error: 'Erro ao buscar artesãos.' }, { status: 500 });
  }
}

// POST: Create a new artisan (Superadmin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.tipo !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nome,
      email,
      senha,
      marca,
      bio,
      whatsapp,
      telefone,
      endereco,
      cidade,
      cep,
      instagram,
      facebook,
      tiktok,
      website,
    } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailExist = await prisma.usuario.findUnique({
      where: { email },
    });
    if (emailExist) {
      return NextResponse.json(
        { error: 'Este e-mail já está sendo utilizado.' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = slugify(nome);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.artesao.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create Usuario and Artesao in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: bcrypt.hashSync(senha, 10),
          tipo: 'ARTESAO',
          status: 'ATIVO',
        },
      });

      const artesao = await tx.artesao.create({
        data: {
          usuarioId: usuario.id,
          nome,
          marca: marca || '',
          slug,
          bio: bio || '',
          whatsapp: whatsapp || '',
          telefone: telefone || '',
          emailContato: email,
          endereco: endereco || '',
          cidade: cidade || 'Resende Costa',
          cep: cep || '',
          instagram: instagram || '',
          facebook: facebook || '',
          tiktok: tiktok || '',
          website: website || '',
          perfilAtivo: true,
        },
      });

      return artesao;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar artesão:', error);
    return NextResponse.json({ error: 'Erro ao criar artesão.' }, { status: 500 });
  }
}
