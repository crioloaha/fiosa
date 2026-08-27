const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.artesao.findMany()
  .then(r => console.log('Successfully connected! Found artisans:', r.length))
  .catch(console.error)
  .finally(() => p.$disconnect());
