const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando sementeira (seed)...');

  // Limpar dados existentes
  await prisma.venda.deleteMany({});
  await prisma.produto.deleteMany({});
  await prisma.categoriaArtesao.deleteMany({});
  await prisma.categoria.deleteMany({});
  await prisma.experiencia.deleteMany({});
  await prisma.artesao.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.configuracao.deleteMany({});

  console.log('Banco de dados limpo.');

  // 1. Criar Usuários
  const senhaAdmin = bcrypt.hashSync('fiosa123', 10);
  const senhaArtesao = bcrypt.hashSync('artesao123', 10);

  const adminUser = await prisma.usuario.create({
    data: {
      nome: 'Administrador FIOSA',
      email: 'admin@fiosa.com.br',
      senha: senhaAdmin,
      tipo: 'ADMIN',
      status: 'ATIVO',
    },
  });

  const uMaria = await prisma.usuario.create({
    data: {
      nome: 'Maria da Silva',
      email: 'maria@fiosa.com.br',
      senha: senhaArtesao,
      tipo: 'ARTESAO',
      status: 'ATIVO',
    },
  });

  const uJose = await prisma.usuario.create({
    data: {
      nome: 'José Souza',
      email: 'jose@fiosa.com.br',
      senha: senhaArtesao,
      tipo: 'ARTESAO',
      status: 'ATIVO',
    },
  });

  const uLucia = await prisma.usuario.create({
    data: {
      nome: 'Lúcia Santos',
      email: 'lucia@fiosa.com.br',
      senha: senhaArtesao,
      tipo: 'ARTESAO',
      status: 'ATIVO',
    },
  });

  console.log('Usuários criados.');

  // 2. Criar Artesãos
  const maria = await prisma.artesao.create({
    data: {
      usuarioId: uMaria.id,
      nome: 'Maria da Silva',
      marca: 'Tear de Ouro',
      slug: 'maria-silva',
      bio: 'Artesã de tear manual tradicional com mais de 30 anos de experiência.',
      historia: 'Maria herdou o tear de pedal de sua avó e, desde os 12 anos, tece histórias em fios de algodão. Hoje, no ateliê Tear de Ouro, mantém viva a tradição da colcha mineira de Resende Costa, reinventando padrões com um olhar contemporâneo de design de interiores.',
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80',
      capa: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80',
      whatsapp: '32999991111',
      telefone: '3233541111',
      emailContato: 'maria.silva@fiosa.com.br',
      endereco: 'Rua São Sebastião, 145, Centro',
      cidade: 'Resende Costa',
      cep: '36340-000',
      localizacaoMapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14949.25603704207!2d-44.2483856!3d-20.9009848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa1b4e2d33458ef%3A0xe54d2417743ea40c!2sResende%20Costa%2C%20MG%2C%2036340-000!5e0!3m2!1spt-BR!2sbr!4v1620000000000',
      instagram: 'teardeouro.resende',
      facebook: 'teardeouro',
      website: 'www.teardeouro.com.br',
      perfilAtivo: true,
      mostrarTelefone: true,
      mostrarEndereco: true,
      mostrarPreco: true,
      aceitarWhats: true,
      visualizacoesPerfil: 342,
      cliquesWhats: 48,
    },
  });

  const jose = await prisma.artesao.create({
    data: {
      usuarioId: uJose.id,
      nome: 'José Souza',
      marca: 'Fios da Terra',
      slug: 'jose-souza',
      bio: 'Criador de peças minimalistas e contemporâneas em linho e fibras orgânicas.',
      historia: 'José é designer têxtil e retornou a Resende Costa para resgatar o tear e mesclá-lo com texturas cruas de fibras vegetais locais, como sisal e linho natural. O seu ateliê Fios da Terra foca em peças de decoração minimalista para arquitetura contemporânea brasileira.',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
      capa: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      whatsapp: '32999992222',
      telefone: '3233542222',
      emailContato: 'jose.souza@fiosa.com.br',
      endereco: 'Avenida Alfredo Penido, 402, Penha',
      cidade: 'Resende Costa',
      cep: '36340-000',
      localizacaoMapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14949.25603704207!2d-44.2483856!3d-20.9009848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa1b4e2d33458ef%3A0xe54d2417743ea40c!2sResende%20Costa%2C%20MG%2C%2036340-000!5e0!3m2!1spt-BR!2sbr!4v1620000000000',
      instagram: 'fiosdaterra.decor',
      perfilAtivo: true,
      mostrarTelefone: false,
      mostrarEndereco: true,
      mostrarPreco: true,
      aceitarWhats: true,
      visualizacoesPerfil: 215,
      cliquesWhats: 29,
    },
  });

  const lucia = await prisma.artesao.create({
    data: {
      usuarioId: uLucia.id,
      nome: 'Lúcia Santos',
      marca: 'Arte & Trama',
      slug: 'lucia-santos',
      bio: 'Especialista em bolsas e acessórios de crochê estruturado e tear de pregos.',
      historia: 'Lúcia transforma fios náuticos e algodão orgânico em bolsas versáteis e acessórios de vestuário autênticos. Unindo técnicas de nós, macramê e tear de pregos, suas peças são famosas pela durabilidade, design contemporâneo e cores inspiradas no cerrado mineiro.',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80',
      capa: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
      whatsapp: '32999993333',
      telefone: '3233543333',
      emailContato: 'lucia.santos@fiosa.com.br',
      endereco: 'Rua das Flores, 88, Várzea',
      cidade: 'Resende Costa',
      cep: '36340-000',
      instagram: 'artetrama.design',
      tiktok: 'artetrama.design',
      perfilAtivo: true,
      mostrarTelefone: true,
      mostrarEndereco: false,
      mostrarPreco: true,
      aceitarWhats: true,
      visualizacoesPerfil: 187,
      cliquesWhats: 38,
    },
  });

  console.log('Artesãos criados.');

  // 3. Criar Categorias Globais
  const catMantas = await prisma.categoria.create({
    data: { nome: 'Mantas', slug: 'mantas', descricao: 'Mantas decorativas para sofás e camas, tecidas em teares manuais.', percentualFiosa: 12.0 },
  });

  const catTapetes = await prisma.categoria.create({
    data: { nome: 'Tapetes', slug: 'tapetes', descricao: 'Tapetes de alta durabilidade com texturas ricas em algodão cru e sisal.', percentualFiosa: 10.0 },
  });

  const catCaminhos = await prisma.categoria.create({
    data: { nome: 'Caminhos de Mesa', slug: 'caminhos-de-mesa', descricao: 'Caminhos de mesa e jogos americanos que trazem charme à mesa posta.', percentualFiosa: 8.0 },
  });

  const catAlmofadas = await prisma.categoria.create({
    data: { nome: 'Almofadas', slug: 'almofadas', descricao: 'Capas de almofada tecidas com fios nobres e tramas orgânicas.', percentualFiosa: 10.0 },
  });

  const catBolsas = await prisma.categoria.create({
    data: { nome: 'Bolsas', slug: 'bolsas', descricao: 'Bolsas e sacolas artesanais de tear de pregos e crochê estruturado.', percentualFiosa: 15.0 },
  });

  const catVestuario = await prisma.categoria.create({
    data: { nome: 'Vestuário', slug: 'vestuario', descricao: 'Echarpes, ponchos e casacos artesanais que unem moda e cultura.', percentualFiosa: 12.0 },
  });

  const catOutros = await prisma.categoria.create({
    data: { nome: 'Outros', slug: 'outros', descricao: 'Peças decorativas e utilitárias diversas.', percentualFiosa: 10.0 },
  });

  console.log('Categorias criadas.');

  // Criar conexões CategoriaArtesao
  await prisma.categoriaArtesao.createMany({
    data: [
      { artesaoId: maria.id, categoriaId: catMantas.id },
      { artesaoId: maria.id, categoriaId: catTapetes.id },
      { artesaoId: jose.id, categoriaId: catCaminhos.id },
      { artesaoId: jose.id, categoriaId: catAlmofadas.id },
      { artesaoId: lucia.id, categoriaId: catBolsas.id },
      { artesaoId: lucia.id, categoriaId: catVestuario.id },
    ]
  });

  // 4. Criar Produtos
  // Maria da Silva
  const p1 = await prisma.produto.create({
    data: {
      artesaoId: maria.id,
      categoriaId: catMantas.id,
      nome: 'Manta Terracota Jacquard',
      slug: 'manta-terracota-jacquard',
      descricao: 'Manta pesada para sofá tecida em tear manual de pedal. O desenho geométrico é inspirado nas tramas coloniais mineiras, ideal para aquecer e decorar com sofisticação.',
      preco: 180.00,
      custo: 80.00,
      fotos: JSON.stringify(['https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80']),
      materiais: '100% Algodão Reciclado',
      tecnica: 'Tear Manual de Pedal',
      dimensoes: '1.50m x 2.20m',
      peso: 1.6,
      disponibilidade: 'DISPONIVEL',
      status: 'PUBLICADO',
      codigo: 'MC-TER-01',
      tags: 'manta, terracota, tear, algodao, decoracao',
      visualizacoes: 412,
    }
  });

  const p2 = await prisma.produto.create({
    data: {
      artesaoId: maria.id,
      categoriaId: catTapetes.id,
      nome: 'Tapete Listrado Areia',
      slug: 'tapete-listrado-areia',
      descricao: 'Tapete firme e encorpado com franjas artesanais amarradas uma a uma. Combina tons neutros de cru, areia e marrom grafite.',
      preco: 120.00,
      custo: 50.00,
      fotos: JSON.stringify(['https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&q=80']),
      materiais: 'Algodão Cru e Fios de Sisal',
      tecnica: 'Tear de Pente Heddle',
      dimensoes: '1.00m x 1.50m',
      peso: 1.2,
      disponibilidade: 'DISPONIVEL',
      status: 'PUBLICADO',
      codigo: 'TP-ARE-02',
      tags: 'tapete, listrado, areia, natural',
      visualizacoes: 231,
    }
  });

  const p3 = await prisma.produto.create({
    data: {
      artesaoId: maria.id,
      categoriaId: catMantas.id,
      nome: 'Manta Verde Oliva de Lã',
      slug: 'manta-verde-oliva-de-la',
      descricao: 'Manta nobre confeccionada com mescla de fios de algodão orgânico e lã natural de ovelha. Uma textura acolhedora e única na cor verde oliva.',
      preco: 220.00,
      custo: 100.00,
      fotos: JSON.stringify(['https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=600&q=80']),
      materiais: '70% Algodão Orgânico, 30% Lã Natural',
      tecnica: 'Tear de Quatro Quadros',
      dimensoes: '1.80m x 2.40m',
      peso: 2.1,
      disponibilidade: 'SOB_ENCOMENDA',
      status: 'PUBLICADO',
      codigo: 'ML-OLI-03',
      tags: 'manta, verde oliva, la, premium',
      visualizacoes: 145,
    }
  });

  // José Souza
  const p4 = await prisma.produto.create({
    data: {
      artesaoId: jose.id,
      categoriaId: catCaminhos.id,
      nome: 'Caminho de Mesa Tradição Mineira',
      slug: 'caminho-de-mesa-tradicao-mineira',
      descricao: 'Trilho de mesa sofisticado com listras em alto-relevo e trama texturizada. Perfeito para mesas de madeira de demolição, trazendo elegância e rusticidade moderna.',
      preco: 85.00,
      custo: 35.00,
      fotos: JSON.stringify(['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80']),
      materiais: '50% Linho, 50% Algodão Cru',
      tecnica: 'Tear Manual de Pente',
      dimensoes: '0.45m x 1.80m',
      peso: 0.4,
      disponibilidade: 'DISPONIVEL',
      status: 'PUBLICADO',
      codigo: 'CM-LIN-04',
      tags: 'caminho de mesa, linho, tear, mesa posta',
      visualizacoes: 302,
    }
  });

  const p5 = await prisma.produto.create({
    data: {
      artesaoId: jose.id,
      categoriaId: catAlmofadas.id,
      nome: 'Almofada Linho Terracota',
      slug: 'almofada-linho-terracota',
      descricao: 'Capa de almofada com frente tecida em tear estruturado com fios de linho e algodão terracota. Traseira em tecido de linho liso e fechamento em zíper invisível.',
      preco: 65.00,
      custo: 25.00,
      fotos: JSON.stringify(['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80']),
      materiais: 'Linho Rústico e Fios de Algodão',
      tecnica: 'Tear Manual e Costura',
      dimensoes: '45cm x 45cm',
      peso: 0.3,
      disponibilidade: 'DISPONIVEL',
      status: 'PUBLICADO',
      codigo: 'AL-TER-05',
      tags: 'almofada, terracota, linho, decoracao',
      visualizacoes: 211,
    }
  });

  // Lúcia Santos
  const p6 = await prisma.produto.create({
    data: {
      artesaoId: lucia.id,
      categoriaId: catBolsas.id,
      nome: 'Bolsa Boho Trama Olive',
      slug: 'bolsa-boho-trama-olive',
      descricao: 'Bolsa de ombro feita com fio náutico na cor verde oliva. Possui forro de algodão cru, alça confortável e detalhes trançados à mão.',
      preco: 150.00,
      custo: 60.00,
      fotos: JSON.stringify(['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80']),
      materiais: 'Fio Náutico de Poliéster, Forro de Algodão Cru',
      tecnica: 'Crochê Estruturado / Tear de Pregos',
      dimensoes: '35cm x 30cm (Alça: 25cm)',
      peso: 0.6,
      disponibilidade: 'DISPONIVEL',
      status: 'PUBLICADO',
      codigo: 'BL-OLI-06',
      tags: 'bolsa, verde oliva, boho, crochê, acessorio',
      visualizacoes: 198,
    }
  });

  const p7 = await prisma.produto.create({
    data: {
      artesaoId: lucia.id,
      categoriaId: catVestuario.id,
      nome: 'Echarpe Algodão Cru & Seda',
      slug: 'echarpe-algodao-cru-e-seda',
      descricao: 'Echarpe extremamente leve e macia, tecida com fios finos de algodão orgânico e fiados artesanais de seda de casulo. Caimento elegante e toque suave.',
      preco: 110.00,
      custo: 45.00,
      fotos: JSON.stringify(['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80']),
      materiais: '80% Algodão Orgânico, 20% Seda de Casulo',
      tecnica: 'Tear Manual de Fios Finos',
      dimensoes: '0.50m x 1.80m',
      peso: 0.2,
      disponibilidade: 'DISPONIVEL',
      status: 'PUBLICADO',
      codigo: 'EC-SEDA-07',
      tags: 'echarpe, seda, algodao cru, cachecol',
      visualizacoes: 154,
    }
  });

  console.log('Produtos criados.');

  // 5. Criar Experiências de Turismo
  await prisma.experiencia.create({
    data: {
      titulo: 'Vivência no Tear de Pente e Pedal',
      slug: 'vivencia-no-tear-de-pente-e-pedal',
      descricao: 'Venha passar uma tarde no ateliê Tear de Ouro com a artesã Maria da Silva. Você aprenderá como funciona a montagem do urdume no tear tradicional, a preparação das lançadeiras e poderá tecer sua própria pequena peça de lembrança. Inclui café com pão de queijo mineiro no encerramento.',
      imagem: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
      localizacao: 'Ateliê Tear de Ouro - Centro, Resende Costa',
      duracao: '3 horas',
      preco: 120.00,
      contato: '32999991111',
      status: 'ATIVO',
    }
  });

  await prisma.experiencia.create({
    data: {
      titulo: 'Oficina de Tingimento com Pigmentos Naturais',
      slug: 'oficina-de-tingimento-com-pigmentos-naturais',
      descricao: 'Descubra a alquimia das cores da terra com o designer José Souza. Uma experiência prática para aprender a extrair pigmentos de cascas de árvores, folhas de eucalipto, sementes de urucum e terras locais para tingir tecidos de linho e algodão. Leve para casa sua amostra tingida.',
      imagem: 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=600&q=80',
      localizacao: 'Ateliê Fios da Terra - Penha, Resende Costa',
      duracao: '4 horas',
      preco: 150.00,
      contato: '32999992222',
      status: 'ATIVO',
    }
  });

  await prisma.experiencia.create({
    data: {
      titulo: 'Roteiro Pelos Ateliês de Resende Costa',
      slug: 'roteiro-pelos-atelies-de-resende-costa',
      descricao: 'Um roteiro guiado que leva você para conhecer os ateliês de tear e crochê ocultos nos bairros históricos de Resende Costa. Conheça as famílias de artesãos que sustentam a cultura da cidade há gerações e compre direto de quem produz.',
      imagem: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
      localizacao: 'Ponto de Encontro: Loja FIOSA - Centro',
      duracao: '2 horas',
      preco: 40.00,
      contato: '32999993333',
      status: 'ATIVO',
    }
  });

  console.log('Experiências criadas.');

  // 6. Criar Vendas Históricas para os Dashboards
  // Maria da Silva
  // Venda 1: 30 dias atrás
  await prisma.venda.create({
    data: {
      artesaoId: maria.id,
      produtoId: p1.id,
      quantidade: 2,
      valorVenda: 180.00 * 2,
      custoTotal: 80.00 * 2,
      contribuicaoFiosa: (180.00 * 2) * 0.12, // 12% retido
      dataVenda: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }
  });

  // Venda 2: 15 dias atrás
  await prisma.venda.create({
    data: {
      artesaoId: maria.id,
      produtoId: p2.id,
      quantidade: 5,
      valorVenda: 120.00 * 5,
      custoTotal: 50.00 * 5,
      contribuicaoFiosa: (120.00 * 5) * 0.10, // 10% retido
      dataVenda: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    }
  });

  // Venda 3: Hoje
  await prisma.venda.create({
    data: {
      artesaoId: maria.id,
      produtoId: p1.id,
      quantidade: 1,
      valorVenda: 180.00,
      custoTotal: 80.00,
      contribuicaoFiosa: 180.00 * 0.12,
      dataVenda: new Date(),
    }
  });

  // José Souza
  // Venda 1: 20 dias atrás
  await prisma.venda.create({
    data: {
      artesaoId: jose.id,
      produtoId: p4.id,
      quantidade: 4,
      valorVenda: 85.00 * 4,
      custoTotal: 35.00 * 4,
      contribuicaoFiosa: (85.00 * 4) * 0.08, // 8% retido
      dataVenda: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    }
  });

  // Venda 2: 10 dias atrás
  await prisma.venda.create({
    data: {
      artesaoId: jose.id,
      produtoId: p5.id,
      quantidade: 6,
      valorVenda: 65.00 * 6,
      custoTotal: 25.00 * 6,
      contribuicaoFiosa: (65.00 * 6) * 0.10, // 10% retido
      dataVenda: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }
  });

  // Lúcia Santos
  // Venda 1: 5 dias atrás
  await prisma.venda.create({
    data: {
      artesaoId: lucia.id,
      produtoId: p6.id,
      quantidade: 3,
      valorVenda: 150.00 * 3,
      custoTotal: 60.00 * 3,
      contribuicaoFiosa: (150.00 * 3) * 0.15, // 15% retido
      dataVenda: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }
  });

  console.log('Vendas históricas criadas.');

  // Criar configuração global padrão
  await prisma.configuracao.create({
    data: {
      id: 'global',
      logoTexto: 'FIOSA',
      logoSubtitulo: 'LOJA COLABORATIVA',
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
    }
  });

  console.log('Configurações globais criadas.');
  console.log('Sementeira (seed) finalizada com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro na sementeira:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
