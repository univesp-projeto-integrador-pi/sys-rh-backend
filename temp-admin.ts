import prisma from './src/config/client';
import bcrypt from 'bcrypt';

(async () => {
  try {
    console.log('🚀 Iniciando seed de Admin...');

    const email = 'admin@teste.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: 'Admin',
        hashPassword: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        name: 'Admin',
        email: email,
        hashPassword: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('─'.repeat(30));
    console.log('✅ Usuário admin pronto!');
    console.log(`ID:    ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Senha: ${password}`);
    console.log(`Role:  ${user.role}`);
    console.log('─'.repeat(30));

  } catch (e: any) {
    console.error('❌ Erro no seed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();