import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

async function getSession(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

// GET: Retrieve sales list (filtered by artisan unless superadmin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const filterArtisanId = searchParams.get('artesaoId') || undefined;

    let whereClause: any = {};

    if (session.tipo === 'ARTESAO') {
      whereClause.artesaoId = session.artesaoId;
    } else if (session.tipo === 'ADMIN' && filterArtisanId) {
      whereClause.artesaoId = filterArtisanId;
    }

    const vendas = await prisma.venda.findMany({
      where: whereClause,
      include: {
        produto: {
          select: {
            nome: true,
            codigo: true,
          },
        },
        artesao: {
          select: {
            nome: true,
            marca: true,
          },
        },
      },
      orderBy: {
        dataVenda: 'desc',
      },
    });

    return NextResponse.json(vendas);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json({ error: 'Erro ao buscar vendas.' }, { status: 500 });
  }
}

// POST: Log a new manual sale (Artisan or Admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { produtoId, quantidade, valorVenda, dataVenda, artesaoId: targetArtesaoId } = body;

    if (!produtoId || !quantidade || !valorVenda) {
      return NextResponse.json(
        { error: 'Produto, quantidade e valor de venda são obrigatórios.' },
        { status: 400 }
      );
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

    // Verify product exists and belongs to this artisan
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
      include: { categoria: true },
    });

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    if (produto.artesaoId !== finalArtesaoId) {
      return NextResponse.json({ error: 'Este produto não pertence a este artesão.' }, { status: 403 });
    }

    // Calculations
    const qty = parseInt(quantidade);
    const priceSold = parseFloat(valorVenda);
    const productCost = produto.custo || 0;
    const totalCost = qty * productCost;
    
    // FIOSA retention percentage from category
    const retentionRate = produto.categoria.percentualFiosa || 10.0;
    const fiosaContribution = priceSold * (retentionRate / 100);

    const venda = await prisma.venda.create({
      data: {
        artesaoId: finalArtesaoId,
        produtoId,
        quantidade: qty,
        valorVenda: priceSold,
        custoTotal: totalCost,
        contribuicaoFiosa: fiosaContribution,
        dataVenda: dataVenda ? new Date(dataVenda) : new Date(),
      },
    });

    return NextResponse.json(venda, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return NextResponse.json({ error: 'Erro ao registrar venda.' }, { status: 500 });
  }
}
