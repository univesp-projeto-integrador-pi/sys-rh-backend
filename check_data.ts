import 'dotenv/config';
import prisma from './src/config/client';

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

    if (!candidate.resume) {
      console.log('\n❌ CURRÍCULO (RESUME): Nenhum currículo criado');
    } else {
      console.log('\n✅ CURRÍCULO (RESUME) ENCONTRADO');

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
    console.error('❌ ERRO AO EXECUTAR SCRIPT:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMariaProfile();