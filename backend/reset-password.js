const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'pedroscharrff@hotmail.com';
    const newPassword = 'senha123'; // Altere para a senha que deseja

    console.log(`🔄 Resetando senha para: ${email}`);
    console.log(`🔑 Nova senha: ${newPassword}\n`);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    console.log('✅ Senha resetada com sucesso!');
    console.log(`\n➡️  Agora você pode fazer login com:`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${newPassword}\n`);
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
