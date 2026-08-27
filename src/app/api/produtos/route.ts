import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// Helper to get session from cookie
async function getSession(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

// Helper to generate a slug from a name
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .trim();
}

// GET: List products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('busca') || undefined;
    const categorySlug = searchParams.get('categoria') || undefined;
    const artisanSlug = searchParams.get('artesao') || undefined;
    const minPrice = searchParams.get('minPreco') ? parseFloat(searchParams.get('minPreco')!) : undefined;
    const maxPrice = searchParams.get('maxPreco') ? parseFloat(searchParams.get('maxPreco')!) : undefined;
    const technique = searchParams.get('tecnica') || undefined;
    const material = searchParams.get('material') || undefined;
    const availability = searchParams.get('disponibilidade') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Admin dashboard specific filters
    const adminMode = searchParams.get('admin') === 'true';
    const artisanIdFilter = searchParams.get('artesaoId') || undefined;

    // Default filters
    let whereClause: any = {};

    // If not in admin mode, only show active products of active artisans
    if (!adminMode) {
      whereClause.status = 'PUBLICADO';
      whereClause.artesao = {
        perfilAtivo: true,
      };
    } else {
      // Admin/Artisan mode: authenticate request
      const session = await getSession(request);
      if (!session) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
      }
      
      if (session.tipo === 'ARTESAO') {
        // Artisan can only see their own products
        whereClause.artesaoId = session.artesaoId;
      } else if (session.tipo === 'ADMIN' && artisanIdFilter) {
        // Superadmin filtering by specific artisan
        whereClause.artesaoId = artisanIdFilter;
      }
    }

    // Apply query filters
    if (search) {
      whereClause.OR = [
        { nome: { contains: search } },
        { descricao: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (categorySlug) {
      whereClause.categoria = { slug: categorySlug };
    }

    if (artisanSlug) {
      whereClause.artesao = { ...whereClause.artesao, slug: artisanSlug };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.preco = {};
      if (minPrice !== undefined) whereClause.preco.gte = minPrice;
      if (maxPrice !== undefined) whereClause.preco.lte = maxPrice;
    }

    if (technique) {
      whereClause.tecnica = { contains: technique };
    }

    if (material) {
      whereClause.materiais = { contains: material };
    }

    if (availability) {
      whereClause.disponibilidade = availability;
    }

    const produtos = await prisma.produto.findMany({
      where: whereClause,
      include: {
        artesao: {
          select: {
            id: true,
            nome: true,
            marca: true,
            slug: true,
            foto: true,
            whatsapp: true,
            perfilAtivo: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro ao buscar produtos.' }, { status: 500 });
  }
}

// POST: Create product (Admin or Artisan)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nome,
      categoriaId,
      descricao,
      preco,
      custo,
      fotos, // array of strings
      materiais,
      tecnica,
      dimensoes,
      peso,
      disponibilidade,
      status,
      codigo,
      tags,
      artesaoId: targetArtesaoId, // only for Superadmin to create on behalf of artisan
      variacoes,
      custoMateriais,
    } = body;

    if (!nome || !categoriaId) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios.' }, { status: 400 });
    }

    // Determine owner artisan ID
    let finalArtesaoId = '';
    if (session.tipo === 'ADMIN') {
      if (!targetArtesaoId) {
        return NextResponse.json({ error: 'Artesão não especificado.' }, { status: 400 });
      }
      finalArtesaoId = targetArtesaoId;
    } else {
      finalArtesaoId = session.artesaoId || '';
    }

    if (!finalArtesaoId) {
      return NextResponse.json({ error: 'Perfil de artesão não vinculado ou inválido.' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = slugify(nome);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.produto.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const produto = await prisma.produto.create({
      data: {
        artesaoId: finalArtesaoId,
        categoriaId,
        nome,
        slug,
        descricao: descricao || '',
        preco: preco ? parseFloat(preco) : null,
        custo: custo ? parseFloat(custo) : null,
        fotos: JSON.stringify(fotos || []),
        materiais: materiais || '',
        tecnica: tecnica || '',
        dimensoes: dimensoes || '',
        peso: peso ? parseFloat(peso) : null,
        disponibilidade: disponibilidade || 'DISPONIVEL',
        status: status || 'PUBLICADO',
        codigo: codigo || '',
        tags: tags || '',
        variacoes: variacoes ? (typeof variacoes === 'string' ? variacoes : JSON.stringify(variacoes)) : null,
        custoMateriais: custoMateriais ? (typeof custoMateriais === 'string' ? custoMateriais : JSON.stringify(custoMateriais)) : null,
      },
    });

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro ao criar produto.' }, { status: 500 });
  }
}
