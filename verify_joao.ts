import 'dotenv/config';
import prisma from './src/config/client';

async function checkJoaoProfile() {
  console.log('\n=== Verificando Perfil de João (Novo Teste) ===\n');
  
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { email: 'joao_teste@teste.com' },
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
      console.log('❌ Nenhum candidato encontrado com email: joao_teste@teste.com');
      
      const allCandidates = await prisma.candidate.findMany({
        select: { email: true, fullName: true }
      });
      console.log('\nCandidatos existentes no banco:');
      allCandidates.forEach(c => console.log(`  - ${c.fullName} (${c.email})`));
      return;
    }

    console.log('✅ CANDIDATO ENCONTRADO:');
    console.log('─'.repeat(60));
    console.log(`ID: ${candidate.id}`);
    console.log(`Nome: ${candidate.fullName}`);
    console.log(`Email: ${candidate.email}`);
    
    const fmtDate = (d: Date | null | undefined) => d ? new Date(d).toLocaleString('pt-BR') : 'N/A';
    console.log(`Criado em: ${fmtDate(candidate.createdAt)}`);

    if (!candidate.resume) {
      console.log('\n❌ CURRÍCULO (RESUME): Nenhum currículo criado');
    } else {
      console.log('\n✅ CURRÍCULO (RESUME) DETALHADO:');
      console.log('─'.repeat(60));

      console.log('\n✅ HABILIDADES:');
      console.log('─'.repeat(60));
      if (candidate.resume.skills.length === 0) {
        console.log('❌ Nenhuma habilidade registrada');
      } else {
        candidate.resume.skills.forEach((rs) => {
          console.log(`  • ${rs.skill.name}`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ STATUS DA VALIDAÇÃO:');
    console.log(`  - Candidato na base: SIM`);
    console.log(`  - Currículo vinculado: ${candidate.resume ? 'SIM' : 'NÃO'}`);
    console.log(`  - Total de Skills: ${candidate.resume?.skills.length || 0}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ ERRO CRÍTICO NO SCRIPT:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJoaoProfile();