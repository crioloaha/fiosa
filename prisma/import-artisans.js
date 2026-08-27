const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const aiScenariosMap = {
  mantas: [
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
    'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800&q=80',
  ],
  tapetes: [
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80',
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
  ],
  caminhos: [
    'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80',
    'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=800&q=80',
  ],
  bolsas: [
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
  ]
};

async function main() {
  console.log('--- Iniciando Importação de Artesãos e Imagens ---');

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('artesao123', salt);

  const categories = await prisma.categoria.findMany();
  const getCatId = (name) => {
    const found = categories.find(c => c.nome.toLowerCase().includes(name.toLowerCase()));
    return found ? found.id : categories[0]?.id;
  };

  const catMantaId = getCatId('Manta');
  const catTapeteId = getCatId('Tapete');
  const catCaminhoId = getCatId('Caminho');
  const catBolsaId = getCatId('Bolsa');

  const srcBaseDir = 'D:\\Arquivos\\Desktop\\COLLAB\\Website\\produtos';
  const destUploadDir = path.join(__dirname, '..', 'public', 'uploads');

  if (!fs.existsSync(destUploadDir)) {
    fs.mkdirSync(destUploadDir, { recursive: true });
  }

  const artisansToImport = [
    {
      nome: 'Alcinéia',
      marca: 'Fios de Alcinéia',
      slug: 'alcineia',
      whatsapp: '32998060001',
      instagram: 'alcineia_fios',
      email: 'alcineia@fiosa.com.br',
    },
    {
      nome: 'Gisele Chagas',
      marca: 'Gi das Gerais',
      slug: 'gisele-chagas',
      whatsapp: '32998060698',
      instagram: 'gidasgerais',
      email: 'gisele@fiosa.com.br',
    },
    {
      nome: 'Isabela Resende',
      marca: 'Tear de Isabela',
      slug: 'isabela-resende',
      whatsapp: '32998060003',
      instagram: 'isabelaresende_tear',
      email: 'isabela@fiosa.com.br',
    },
    {
      nome: 'Jaqueline',
      marca: 'Mãos de Jaqueline',
      slug: 'jaqueline',
      whatsapp: '32998060004',
      instagram: 'jaqueline_tecelagem',
      email: 'jaqueline@fiosa.com.br',
    },
    {
      nome: 'Roseli Antunes',
      marca: 'Achei Roseli',
      slug: 'roseli-antunes',
      whatsapp: '32998060005',
      instagram: 'roseliantunes_tear',
      email: 'roseli@fiosa.com.br',
    }
  ];

  for (const art of artisansToImport) {
    console.log(`\nProcessando artesão: ${art.nome}...`);

    let user = await prisma.usuario.findUnique({
      where: { email: art.email }
    });

    if (!user) {
      user = await prisma.usuario.create({
        data: {
          nome: art.nome,
          email: art.email,
          senha: defaultPasswordHash,
          tipo: 'ARTESAO',
          status: 'ATIVO',
        }
      });
      console.log(`- Conta de usuário criada: ${art.email}`);
    }

    let artisan = await prisma.artesao.findFirst({
      where: {
        OR: [
          { usuarioId: user.id },
          { slug: art.slug }
        ]
      }
    });

    if (!artisan) {
      artisan = await prisma.artesao.create({
        data: {
          nome: art.nome,
          marca: art.marca,
          slug: art.slug,
          whatsapp: art.whatsapp,
          instagram: art.instagram,
          perfilAtivo: true,
          usuarioId: user.id,
        }
      });
      console.log(`- Perfil de artesão criado: ${art.nome} (${art.marca})`);
    } else {
      console.log(`- Perfil de artesão já existia.`);
    }

    const artSrcFolder = path.join(srcBaseDir, art.nome);
    if (!fs.existsSync(artSrcFolder)) {
      console.log(`! Pasta do artesão não encontrada: ${artSrcFolder}`);
      continue;
    }

    const files = fs.readdirSync(artSrcFolder);
    const imageFiles = files.filter(f => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png'));

    console.log(`- Encontradas ${imageFiles.length} imagens locais.`);

    const copiedImagePaths = [];
    imageFiles.forEach((file, idx) => {
      const ext = path.extname(file);
      const uniqueName = `${art.slug}-prod-${idx}-${Date.now()}${ext}`;
      const srcPath = path.join(artSrcFolder, file);
      const destPath = path.join(destUploadDir, uniqueName);
      
      try {
        fs.copyFileSync(srcPath, destPath);
        copiedImagePaths.push(`/uploads/${uniqueName}`);
      } catch (e) {
        console.error(`Erro ao copiar imagem ${file}:`, e.message);
      }
    });

    console.log(`- Copiadas ${copiedImagePaths.length} imagens com sucesso.`);

    if (art.slug === 'gisele-chagas') {
      const pdfProducts = [
        {
          nome: 'Jogo de Passadeira Bico Folha (3 peças)',
          categoriaId: catMantaId,
          preco: 180.00,
          custo: 80.00,
          descricao: 'Jogo clássico de passadeira composto por 3 peças no bico folha. Tecido resistente no tear manual. Contém 2 tapetes de 50cm x 80cm e 1 passadeira de 50cm x 1.50m.',
          dimensoes: '1 passadeira 50cm x 1.50m + 2 tapetes 50cm x 80cm',
          tecnica: 'Tear Manual de Pedal',
          materiais: '100% Algodão',
          disponibilidade: 'SOB_ENCOMENDA',
          fotos: [aiScenariosMap.mantas[0], aiScenariosMap.mantas[1]],
        },
        {
          nome: 'Jogo de Passadeira Listrado (3 peças)',
          categoriaId: catMantaId,
          preco: 160.00,
          custo: 70.00,
          descricao: 'Jogo de passadeira listrado contemporâneo. Produzido com fios selecionados de algodão colorido no tear tradicional.',
          dimensoes: '1 passadeira 50cm x 1.50m + 2 tapetes 50cm x 80cm',
          tecnica: 'Tear Manual',
          materiais: 'Fio de Algodão Cru e Colorido',
          disponibilidade: 'DISPONIVEL',
          fotos: [aiScenariosMap.mantas[1]],
        },
        {
          nome: 'Tapete Médio Bico Folha 80x150',
          categoriaId: catTapeteId,
          preco: 110.00,
          custo: 50.00,
          descricao: 'Tapete avulso médio de algodão no padrão bico folha. Ideal para beira de cama, corredores ou salas.',
          dimensoes: '80cm x 1.50m',
          tecnica: 'Tear Manual de Pedal',
          materiais: 'Algodão Cru',
          disponibilidade: 'DISPONIVEL',
          fotos: [aiScenariosMap.tapetes[0], aiScenariosMap.tapetes[1]],
        },
        {
          nome: 'Tapetinho Bico Tradicional 50x80',
          categoriaId: catTapeteId,
          preco: 45.00,
          custo: 20.00,
          descricao: 'Tapete pequeno avulso em tear manual. Fácil de lavar, macio e durável. Desenho geométrico tradicional de Resende Costa.',
          dimensoes: '50cm x 80cm',
          tecnica: 'Tear Manual',
          materiais: 'Algodão',
          disponibilidade: 'DISPONIVEL',
          fotos: [aiScenariosMap.tapetes[1]],
        }
      ];

      for (const pInfo of pdfProducts) {
        const exists = await prisma.produto.findFirst({
          where: { nome: pInfo.nome, artesaoId: artisan.id }
        });
        if (!exists) {
          const slug = slugify(pInfo.nome) + '-' + Date.now();
          await prisma.produto.create({
            data: {
              nome: pInfo.nome,
              slug,
              descricao: pInfo.descricao,
              preco: pInfo.preco,
              custo: pInfo.custo,
              fotos: JSON.stringify(pInfo.fotos),
              dimensoes: pInfo.dimensoes,
              tecnica: pInfo.tecnica,
              materiais: pInfo.materiais,
              disponibilidade: pInfo.disponibilidade,
              status: 'PUBLICADO',
              artesaoId: artisan.id,
              categoriaId: pInfo.categoriaId,
            }
          });
        }
      }
      console.log(`- Criados 4 produtos do catálogo PDF para Gisele Chagas.`);
    } else {
      let photoIdx = 0;
      let prodIdx = 1;

      while (photoIdx < copiedImagePaths.length) {
        const prodPhotos = [];
        
        prodPhotos.push(copiedImagePaths[photoIdx]);
        photoIdx++;
        
        if (photoIdx < copiedImagePaths.length && Math.random() > 0.5) {
          prodPhotos.push(copiedImagePaths[photoIdx]);
          photoIdx++;
        }

        let pName = '';
        let pDesc = '';
        let pCatId = catTapeteId;
        let pPrice = 95.00;
        let pCusto = 40.00;
        let pMaterials = '100% Algodão Cru';
        let pTech = 'Tear Manual de Pedal';
        let pDim = '80cm x 1.40m';

        const aiFallbacks = aiScenariosMap.tapetes;

        if (prodIdx % 3 === 1) {
          pName = `Tapete Passadeira Clássica ${art.nome} #${prodIdx}`;
          pDesc = `Passadeira de algodão tecida em tear manual tradicional de Resende Costa. Modelo com franjas e toque macio.`;
          pCatId = catTapeteId;
          pPrice = 120.00;
          pCusto = 50.00;
          pDim = '60cm x 1.80m';
          prodPhotos.unshift(aiFallbacks[0]);
        } else if (prodIdx % 3 === 2) {
          pName = `Manta para Sofá Colonial ${art.nome} #${prodIdx}`;
          pDesc = `Manta artesanal encorpada de algodão para sofá ou cama de casal. Detalhes tridimensionais tecidos à mão.`;
          pCatId = catMantaId;
          pPrice = 195.00;
          pCusto = 90.00;
          pDim = '1.80m x 2.20m';
          pMaterials = 'Fio de Algodão Cardado';
          pTech = 'Tear de Minas';
          prodPhotos.unshift(aiScenariosMap.mantas[1]);
        } else {
          pName = `Caminho de Mesa Trama Fina ${art.nome} #${prodIdx}`;
          pDesc = `Caminho de mesa rendado sob tear manual. Uma peça elegante e neutra para compor salas de jantar contemporâneas.`;
          pCatId = catCaminhoId;
          pPrice = 75.00;
          pCusto = 30.00;
          pDim = '45cm x 1.50m';
          pTech = 'Tear de Minas com Crochê';
          prodPhotos.unshift(aiScenariosMap.caminhos[0]);
        }

        const exists = await prisma.produto.findFirst({
          where: { nome: pName, artesaoId: artisan.id }
        });

        if (!exists) {
          const slug = slugify(pName) + '-' + Date.now();
          await prisma.produto.create({
            data: {
              nome: pName,
              slug,
              descricao: pDesc,
              preco: pPrice,
              custo: pCusto,
              fotos: JSON.stringify(prodPhotos),
              dimensoes: pDim,
              tecnica: pTech,
              materiais: pMaterials,
              disponibilidade: 'DISPONIVEL',
              status: 'PUBLICADO',
              artesaoId: artisan.id,
              categoriaId: pCatId,
            }
          });
        }

        prodIdx++;
      }
      console.log(`- Criados ${prodIdx - 1} produtos para ${art.nome} utilizando as fotos enviadas.`);
    }
  }

  console.log('\n--- Processo Finalizado com Sucesso ---');
}

main()
  .catch((e) => {
    console.error('Erro de Execução:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
