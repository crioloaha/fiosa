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
      favicon,
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
      sobreResendeCostaTitulo,
      sobreResendeCostaTexto1,
      sobreResendeCostaTexto2,
      sobreResendeCostaImagem,
      visiteIntroTitulo,
      visiteIntroTexto,
      visiteSecao1Titulo,
      visiteSecao1Texto,
      visiteSecao1Imagem,
      visiteSecao2Titulo,
      visiteSecao2Texto,
      visiteSecao2Imagem,
      experienciasIntroTitulo,
      experienciasIntroTexto,
      contatoIntroTitulo,
      contatoIntroTexto,
      ctaTitulo,
      ctaSubtitulo,
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
        favicon,
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
        sobreResendeCostaTitulo,
        sobreResendeCostaTexto1,
        sobreResendeCostaTexto2,
        sobreResendeCostaImagem,
        visiteIntroTitulo,
        visiteIntroTexto,
        visiteSecao1Titulo,
        visiteSecao1Texto,
        visiteSecao1Imagem,
        visiteSecao2Titulo,
        visiteSecao2Texto,
        visiteSecao2Imagem,
        experienciasIntroTitulo,
        experienciasIntroTexto,
        contatoIntroTitulo,
        contatoIntroTexto,
        ctaTitulo,
        ctaSubtitulo,
      },
      create: {
        id: 'global',
        logoTexto: logoTexto || 'FIOSA',
        logoSubtitulo: logoSubtitulo || 'LOJA COLABORATIVA',
        logoImagem,
        logoTextoImagem,
        favicon,
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
        sobreResendeCostaTitulo: sobreResendeCostaTitulo || "Resende Costa, a Capital Mineira do Tear",
        sobreResendeCostaTexto1: sobreResendeCostaTexto1 || "Localizada no Campo das Vertentes, vizinha de São João del-Rei e Tiradentes...",
        sobreResendeCostaTexto2: sobreResendeCostaTexto2 || "Caminhar pelas lojas de Resende Costa...",
        sobreResendeCostaImagem: sobreResendeCostaImagem || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
        visiteIntroTitulo: visiteIntroTitulo || "Conheça a Nossa Cidade",
        visiteIntroTexto: visiteIntroTexto || "Resende Costa está localizada...",
        visiteSecao1Titulo: visiteSecao1Titulo || "A Tradição do Tear",
        visiteSecao1Texto: visiteSecao1Texto || "A tradição do tear em Resende Costa...",
        visiteSecao1Imagem: visiteSecao1Imagem || "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&q=80",
        visiteSecao2Titulo: visiteSecao2Titulo || "O Artesanato Local",
        visiteSecao2Texto: visiteSecao2Texto || "Ao caminhar pelas ruas de Resende...",
        visiteSecao2Imagem: visiteSecao2Imagem || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80",
        experienciasIntroTitulo: experienciasIntroTitulo || "Experiências & Turismo Cultural",
        experienciasIntroTexto: experienciasIntroTexto || "Participe de vivências exclusivas...",
        contatoIntroTitulo: contatoIntroTitulo || "Contato da FIOSA",
        contatoIntroTexto: contatoIntroTexto || "Tem alguma dúvida sobre os produtos...",
        ctaTitulo: ctaTitulo || "Venha conhecer os fios que conectam Resende Costa.",
        ctaSubtitulo: ctaSubtitulo || "Nossos artesãos e ateliês estão de portas abertas...",
      },
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro ao atualizar configurações.' }, { status: 500 });
  }
}
