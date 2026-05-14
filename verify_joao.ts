import 'dotenv/config';
import prisma from './src/config/client';

async function checkJoaoProfile() {
  console.log('\n=== Verificando Perfil de João (Novo Teste) ===\n');
  
  try {
    // Find the recently created candidate (João Teste with email joao_teste@teste.com)
    const candidate = await prisma.candidate.findUnique({
      where: { email: 'joao_teste@teste.com' },
      include: {
        resume: {
          include: {
            educations: true,
            experiences: true,
            skills: true
          }
        }
      }
    });

    if (!candidate) {
      console.log('❌ Nenhum candidato encontrado com email: joao_teste@teste.com');
      
      // Try to find all candidates to debug
      const allCandidates = await prisma.candidate.findMany({
        select: { email: true, fullName: true }
      });
      console.log('\nCandidatos existentes:');
      allCandidates.forEach(c => console.log(`  - ${c.fullName} (${c.email})`));
      return;
    }

    console.log('✅ CANDIDATO ENCONTRADO:');
    console.log('─'.repeat(60));
    console.log(`ID: ${candidate.id}`);
    console.log(`Nome: ${candidate.fullName}`);
    console.log(`Email: ${candidate.email}`);
    console.log(`Telefone: ${candidate.phone}`);
    console.log(`Criado em: ${new Date(candidate.createdAt).toLocaleString('pt-BR')}`);
    console.log(`Atualizado em: ${new Date(candidate.updatedAt).toLocaleString('pt-BR')}`);

    console.log('\n✅ CURRÍCULO (RESUME):');
    console.log('─'.repeat(60));
    if (!candidate.resume) {
      console.log('❌ Nenhum currículo criado');
    } else {
      console.log(`ID: ${candidate.resume.id}`);
      console.log(`Criado em: ${new Date(candidate.resume.createdAt).toLocaleString('pt-BR')}`);
      console.log(`Atualizado em: ${new Date(candidate.resume.updatedAt).toLocaleString('pt-BR')}`);

      console.log('\n✅ FORMAÇÕES EDUCACIONAIS:');
      console.log('─'.repeat(60));
      if (candidate.resume.educations.length === 0) {
        console.log('❌ Nenhuma formação registrada');
      } else {
        candidate.resume.educations.forEach((edu, index) => {
          console.log(`\n📚 Formação ${index + 1}:`);
          console.log(`  ID: ${edu.id}`);
          console.log(`  Instituição: ${edu.institution}`);
          console.log(`  Grau: ${edu.degree}`);
          console.log(`  Curso: ${edu.fieldOfStudy}`);
          console.log(`  Início: ${new Date(edu.startDate).toLocaleDateString('pt-BR')}`);
          console.log(`  Fim: ${edu.endDate ? new Date(edu.endDate).toLocaleDateString('pt-BR') : 'Em andamento'}`);
        });
      }

      console.log('\n✅ EXPERIÊNCIAS PROFISSIONAIS:');
      console.log('─'.repeat(60));
      if (candidate.resume.experiences.length === 0) {
        console.log('❌ Nenhuma experiência registrada');
      } else {
        candidate.resume.experiences.forEach((exp, index) => {
          console.log(`\n💼 Experiência ${index + 1}:`);
          console.log(`  ID: ${exp.id}`);
          console.log(`  Empresa: ${exp.companyName}`);
          console.log(`  Cargo: ${exp.jobTitle}`);
          console.log(`  Início: ${new Date(exp.startDate).toLocaleDateString('pt-BR')}`);
          console.log(`  Fim: ${exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-BR') : 'Atual'}`);
        });
      }

      console.log('\n✅ HABILIDADES:');
      console.log('─'.repeat(60));
      if (candidate.resume.skills.length === 0) {
        console.log('❌ Nenhuma habilidade registrada');
      } else {
        candidate.resume.skills.forEach((skill) => {
          console.log(`  • ${skill.skill.name}`);
        });
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
    console.log('✅ RESUMO DE VALIDAÇÃO:');
    console.log('─'.repeat(60));
    console.log(`✓ Candidato criado: SIM`);
    console.log(`✓ Resume criado: ${candidate.resume ? 'SIM' : 'NÃO'}`);
    console.log(`✓ Educação registrada: ${candidate.resume?.educations.length > 0 ? 'SIM' : 'NÃO'}`);
    console.log(`✓ Dados consistentes: ${candidate.resume?.educations.length === 1 ? 'SIM' : 'NÃO'}\n`);

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJoaoProfile();
