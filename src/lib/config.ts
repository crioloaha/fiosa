import { prisma } from './prisma';

export const DEFAULT_CONFIG = {
  id: 'global',
  logoTexto: 'FIOSA',
  logoSubtitulo: 'LOJA COLABORATIVA',
  logoImagem: null as string | null,
  logoTextoImagem: null as string | null,
  
  heroTag: 'Tradição & Design',
  heroTitulo: 'FIOS QUE CONTAM\nHISTÓRIAS.',
  heroSubtitulo: 'Uma loja colaborativa que reúne artesãos de Resende Costa e transforma tradição em arte, design contemporâneo e experiências.',
  heroImagem: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1600&q=80',
  
  fiosaTag: 'Nosso Propósito',
  fiosaTitulo: 'A união de fios, saberes e pessoas de Resende Costa.',
  fiosaTexto1: 'A FIOSA nasceu com o compromisso de fortalecer o artesanato de Resende Costa, Minas Gerais. Funcionamos como uma ponte que conecta a rica herança cultural do tear com o design contemporâneo e a decoração de interiores.',
  fiosaTexto2: 'Como uma loja colaborativa, apoiamos diretamente a economia local. Cada artesão cadastrado tem total controle sobre seu catálogo, define seus preços e recebe o contato direto de clientes interessados, impulsionando a venda sem intermediários e valorizando a autoria de cada trama.',
  fiosaImagem: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
  
  paletaNome: 'ORIGINAL',
  corPrimaria: '#C15C3D',
  corSecundaria: '#606C38',
  corFundo: '#FDFBF7',
  corFundoAlternativo: '#F3EFE9',
  corTexto: '#2B2D2F',
  corBorda: '#8D7F73',
  
  rodapeSlogan: 'Fios que conectam pessoas, histórias e lugares.',
  rodapeDescricao: 'A FIOSA é uma vitrine e espaço colaborativo que une artesãos de Resende Costa/MG, promovendo o design brasileiro, a tradição secular do tear e a economia criativa local.',
  contatoEndereco: 'Rua São Sebastião, 100 - Centro\nResende Costa - MG, CEP 36340-000',
  contatoAtendimento: 'Segunda a Sábado: 09h às 18h\nDomingos: 09h às 14h',
  contatoWhatsapp: '(32) 99999-1111',
  contatoTelefone: '(32) 3354-1111',
  contatoEmail: 'contato@fiosa.com.br',
  contatoInstagram: 'fiosa.colaborativa'
};

export const COLOR_PALETTES = {
  ORIGINAL: {
    corPrimaria: '#C15C3D',
    corSecundaria: '#606C38',
    corFundo: '#FDFBF7',
    corFundoAlternativo: '#F3EFE9',
    corTexto: '#2B2D2F',
    corBorda: '#8D7F73',
  },
  TERRA: {
    corPrimaria: '#A75D5D',
    corSecundaria: '#4C6793',
    corFundo: '#FFFBE9',
    corFundoAlternativo: '#F1DEC9',
    corTexto: '#2C3639',
    corBorda: '#D5B4B4',
  },
  OCEANO: {
    corPrimaria: '#0284C7',
    corSecundaria: '#0D9488',
    corFundo: '#F8FAFC',
    corFundoAlternativo: '#F1F5F9',
    corTexto: '#0F172A',
    corBorda: '#CBD5E1',
  },
  FLORESTA: {
    corPrimaria: '#1E5128',
    corSecundaria: '#4E9F3D',
    corFundo: '#F6FBF4',
    corFundoAlternativo: '#EBF4EC',
    corTexto: '#191A19',
    corBorda: '#D8E9A8',
  },
  MONOCROMATICA: {
    corPrimaria: '#18181B',
    corSecundaria: '#52525B',
    corFundo: '#FAFAFA',
    corFundoAlternativo: '#F4F4F5',
    corTexto: '#09090B',
    corBorda: '#D4D4D8',
  }
};

export async function getConfig() {
  try {
    const config = await prisma.configuracao.findUnique({
      where: { id: 'global' },
    });
    return config || DEFAULT_CONFIG;
  } catch (error) {
    console.error('Falha ao buscar configurações do banco, usando padrão:', error);
    return DEFAULT_CONFIG;
  }
}
