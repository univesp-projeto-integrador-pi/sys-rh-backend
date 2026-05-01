import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMariaProfile() {
  console.log('\n=== Verificando Perfil de Maria ===\n');
  
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { email: 'maria@teste.com' },
      include: {
        resume: {
          include: {
            educations: true,
            experiences: true,
            skills: {
              include: {
                skill: true 
              }
            }
          }
        }
      }
    });

    if (!candidate) {
      console.log('❌ Nenhum candidato encontrado com email: maria@teste.com');
      return;
    }

    console.log('✅ CANDIDATO ENCONTRADO:');
    console.log('─'.repeat(50));
    console.log(`ID: ${candidate.id}`);
    console.log(`Nome: ${candidate.fullName}`);
    console.log(`Email: ${candidate.email}`);
    const createdAt = candidate.createdAt ? new Date(candidate.createdAt).toLocaleString('pt-BR') : 'N/A';
    const updatedAt = candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleString('pt-BR') : 'N/A';
    console.log(`Criado em: ${createdAt}`);
    console.log(`Atualizado em: ${updatedAt}`);

    console.log('\n✅ CURRÍCULO (RESUME):');
    console.log('─'.repeat(50));

    if (!candidate.resume) {
      console.log('❌ Nenhum currículo criado');
    } else {
      console.log('\n✅ HABILIDADES:');
      console.log('─'.repeat(50));
      if (candidate.resume.skills.length === 0) {
        console.log('❌ Nenhuma habilidade registrada');
      } else {
        candidate.resume.skills.forEach((rs) => {
          console.log(`  • ${rs.skill.name}`);
        });
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ ERRO DURANTE A EXECUÇÃO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMariaProfile();