const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.configuracao.findUnique({ where: { id: 'global' } })
  .then(c => console.log('Logo fields:', { logoImagem: c.logoImagem, logoTextoImagem: c.logoTextoImagem }))
  .catch(console.error)
  .finally(() => p.$disconnect());
