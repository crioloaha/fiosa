import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { COLOR_PALETTES } from '@/lib/config';

async function getSession(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function GET() {
  try {
    const config = await prisma.configuracao.findUnique({
      where: { id: 'global' },
    });
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.tipo !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    
    // Deconstruct and validate inputs
    const {
      logoTexto,
      logoSubtitulo,
      logoImagem,
      logoTextoImagem,
      heroTag,
      heroTitulo,
      heroSubtitulo,
      heroImagem,
      fiosaTag,
      fiosaTitulo,
      fiosaTexto1,
      fiosaTexto2,
      fiosaImagem,
      paletaNome,
      rodapeSlogan,
      rodapeDescricao,
      contatoEndereco,
      contatoAtendimento,
      contatoWhatsapp,
      contatoTelefone,
      contatoEmail,
      contatoInstagram,
    } = body;

    let {
      corPrimaria,
      corSecundaria,
      corFundo,
      corFundoAlternativo,
      corTexto,
      corBorda,
    } = body;

    // Apply color presets if the palette name matches one of the presets and is not CUSTOM/PERSONALIZADA
    if (paletaNome && paletaNome !== 'PERSONALIZADA') {
      const preset = COLOR_PALETTES[paletaNome as keyof typeof COLOR_PALETTES];
      if (preset) {
        corPrimaria = preset.corPrimaria;
        corSecundaria = preset.corSecundaria;
        corFundo = preset.corFundo;
        corFundoAlternativo = preset.corFundoAlternativo;
        corTexto = preset.corTexto;
        corBorda = preset.corBorda;
      }
    }

    const updatedConfig = await prisma.configuracao.upsert({
      where: { id: 'global' },
      update: {
        logoTexto,
        logoSubtitulo,
        logoImagem,
        logoTextoImagem,
        heroTag,
        heroTitulo,
        heroSubtitulo,
        heroImagem,
        fiosaTag,
        fiosaTitulo,
        fiosaTexto1,
        fiosaTexto2,
        fiosaImagem,
        paletaNome,
        corPrimaria,
        corSecundaria,
        corFundo,
        corFundoAlternativo,
        corTexto,
        corBorda,
        rodapeSlogan,
        rodapeDescricao,
        contatoEndereco,
        contatoAtendimento,
        contatoWhatsapp,
        contatoTelefone,
        contatoEmail,
        contatoInstagram,
      },
      create: {
        id: 'global',
        logoTexto: logoTexto || 'FIOSA',
        logoSubtitulo: logoSubtitulo || 'LOJA COLABORATIVA',
        logoImagem,
        logoTextoImagem,
        heroTag: heroTag || 'Tradição & Design',
        heroTitulo: heroTitulo || 'FIOS QUE CONTAM\nHISTÓRIAS.',
        heroSubtitulo: heroSubtitulo || 'Uma loja colaborativa...',
        heroImagem: heroImagem || '',
        fiosaTag: fiosaTag || 'Nosso Propósito',
        fiosaTitulo: fiosaTitulo || 'A união de fios...',
        fiosaTexto1: fiosaTexto1 || '',
        fiosaTexto2: fiosaTexto2 || '',
        fiosaImagem: fiosaImagem || '',
        paletaNome: paletaNome || 'ORIGINAL',
        corPrimaria: corPrimaria || '#C15C3D',
        corSecundaria: corSecundaria || '#606C38',
        corFundo: corFundo || '#FDFBF7',
        corFundoAlternativo: corFundoAlternativo || '#F3EFE9',
        corTexto: corTexto || '#2B2D2F',
        corBorda: corBorda || '#8D7F73',
        rodapeSlogan: rodapeSlogan || 'Fios que conectam...',
        rodapeDescricao: rodapeDescricao || '',
        contatoEndereco: contatoEndereco || '',
        contatoAtendimento: contatoAtendimento || '',
        contatoWhatsapp: contatoWhatsapp || '',
        contatoTelefone: contatoTelefone || '',
        contatoEmail: contatoEmail || '',
        contatoInstagram: contatoInstagram || '',
      },
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro ao atualizar configurações.' }, { status: 500 });
  }
}
