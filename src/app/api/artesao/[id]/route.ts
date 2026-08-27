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

function isUUID(str: string) {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return pattern.test(str);
}

// GET: Retrieve a single artisan by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const where: any = isUUID(id) ? { id } : { slug: id };

    const artesao = await prisma.artesao.findFirst({
      where,
      include: {
        produtos: {
          where: {
            status: 'PUBLICADO',
          },
          include: {
            categoria: true,
          },
        },
        categorias: {
          include: {
            categoria: true,
          },
        },
      },
    });

    if (!artesao) {
      return NextResponse.json({ error: 'Artesão não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(artesao);
  } catch (error) {
    console.error('Erro ao buscar artesão:', error);
    return NextResponse.json({ error: 'Erro ao buscar artesão.' }, { status: 500 });
  }
}

// PUT: Update an artisan profile (Admin or Artisan owner)
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

    const artesao = await prisma.artesao.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!artesao) {
      return NextResponse.json({ error: 'Artesão não encontrado.' }, { status: 404 });
    }

    // Check permissions: Admin or owner Artisan
    if (session.tipo !== 'ADMIN' && artesao.id !== session.artesaoId) {
      return NextResponse.json({ error: 'Não autorizado a editar este perfil.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      nome,
      marca,
      bio,
      historia,
      foto,
      capa,
      whatsapp,
      telefone,
      emailContato,
      endereco,
      cidade,
      cep,
      localizacaoMapa,
      instagram,
      facebook,
      tiktok,
      website,
      perfilAtivo,
      mostrarTelefone,
      mostrarEndereco,
      mostrarPreco,
      aceitarWhats,
      senha, // optional password update
      email, // optional user email update (only admin can change)
      status, // optional user status update (only admin can change)
    } = body;

    // Slug regeneration if name changed
    let slug = artesao.slug;
    if (nome && nome !== artesao.nome) {
      const baseSlug = slugify(nome);
      slug = baseSlug;
      let counter = 1;
      while (await prisma.artesao.findFirst({ where: { slug, id: { not: id } } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Update in transaction to update user details too if needed
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update User info if credentials or status are being changed
      const userUpdateData: any = {};
      if (nome) userUpdateData.nome = nome;
      if (senha) userUpdateData.senha = bcrypt.hashSync(senha, 10);
      
      if (session.tipo === 'ADMIN') {
        if (email && email !== artesao.usuario.email) {
          // Check uniqueness
          const emailUsed = await tx.usuario.findFirst({
            where: { email, id: { not: artesao.usuarioId } },
          });
          if (emailUsed) throw new Error('E-mail já está em uso.');
          userUpdateData.email = email;
        }
        if (status) userUpdateData.status = status;
      }

      if (Object.keys(userUpdateData).length > 0) {
        await tx.usuario.update({
          where: { id: artesao.usuarioId },
          data: userUpdateData,
        });
      }

      // 2. Update Artisan info
      return tx.artesao.update({
        where: { id },
        data: {
          nome: nome ?? artesao.nome,
          marca: marca !== undefined ? marca : artesao.marca,
          slug,
          bio: bio !== undefined ? bio : artesao.bio,
          historia: historia !== undefined ? historia : artesao.historia,
          foto: foto !== undefined ? foto : artesao.foto,
          capa: capa !== undefined ? capa : artesao.capa,
          whatsapp: whatsapp !== undefined ? whatsapp : artesao.whatsapp,
          telefone: telefone !== undefined ? telefone : artesao.telefone,
          emailContato: emailContato !== undefined ? emailContato : artesao.emailContato,
          endereco: endereco !== undefined ? endereco : artesao.endereco,
          cidade: cidade !== undefined ? cidade : artesao.cidade,
          cep: cep !== undefined ? cep : artesao.cep,
          localizacaoMapa: localizacaoMapa !== undefined ? localizacaoMapa : artesao.localizacaoMapa,
          instagram: instagram !== undefined ? instagram : artesao.instagram,
          facebook: facebook !== undefined ? facebook : artesao.facebook,
          tiktok: tiktok !== undefined ? tiktok : artesao.tiktok,
          website: website !== undefined ? website : artesao.website,
          perfilAtivo: perfilAtivo !== undefined ? perfilAtivo : artesao.perfilAtivo,
          mostrarTelefone: mostrarTelefone !== undefined ? mostrarTelefone : artesao.mostrarTelefone,
          mostrarEndereco: mostrarEndereco !== undefined ? mostrarEndereco : artesao.mostrarEndereco,
          mostrarPreco: mostrarPreco !== undefined ? mostrarPreco : artesao.mostrarPreco,
          aceitarWhats: aceitarWhats !== undefined ? aceitarWhats : artesao.aceitarWhats,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erro ao atualizar artesão:', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar artesão.' }, { status: 500 });
  }
}

// DELETE: Delete an artisan (Superadmin only)
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

    const artesao = await prisma.artesao.findUnique({
      where: { id },
    });

    if (!artesao) {
      return NextResponse.json({ error: 'Artesão não encontrado.' }, { status: 404 });
    }

    // Delete corresponding Usuario (will cascade delete Artesao due to prisma relation setup)
    await prisma.usuario.delete({
      where: { id: artesao.usuarioId },
    });

    return NextResponse.json({ success: true, message: 'Artesão e seu usuário excluídos com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir artesão:', error);
    return NextResponse.json({ error: 'Erro ao excluir artesão.' }, { status: 500 });
  }
}
