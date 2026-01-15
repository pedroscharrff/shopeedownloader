const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDB() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        createdAt: true,
      }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados!');
      console.log('➡️  Você precisa criar uma conta em /register primeiro\n');
    } else {
      console.log(`✅ Encontrados ${users.length} usuário(s):\n`);
      users.forEach(user => {
        console.log(`  📧 Email: ${user.email}`);
        console.log(`  👤 Nome: ${user.name}`);
        console.log(`  💎 Plano: ${user.planType}`);
        console.log(`  📅 Criado em: ${user.createdAt}`);
        console.log('  ---');
      });
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
