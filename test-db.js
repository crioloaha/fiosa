const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.artesao.findMany().then(r =, r.length)).catch(console.error).finally(() = 
