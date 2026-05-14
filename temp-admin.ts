import prisma from './src/config/client';
import bcrypt from 'bcrypt';

(async () => {
  try {
    // Remover usuário antigo se existir
    try {
      await prisma.user.delete({ where: { email: 'admin@teste.com' } });
      console.log('✅ Usuário antigo removido');
    } catch (e) {
      // Usuário não existe, tudo bem
    }
    
    // Criar novo usuário admin com senha conhecida
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@teste.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Email: admin@teste.com');
    console.log('Senha: 123456');
    console.log('Role: ADMIN');
  } catch (e: any) {
    console.error('❌ Erro:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
