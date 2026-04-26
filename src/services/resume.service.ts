import resumeRepository from '../repositories/resume.repository';
import candidateRepository from '../repositories/candidate.repository';
import { AppError } from '../middlewares/errorHandler.middleware';
import { CreateResumeDTO, UpdateResumeDTO } from '../dto/resume.dto';

/**
 * @service ResumeService
 * @description Gerencia o currículo de candidatos no processo seletivo.
 *
 * Responsabilidades:
 * - Criar o currículo de um candidato com experiências, formações e skills
 * - Consultar o currículo pelo ID do candidato
 * - Atualizar currículo substituindo completamente experiências, formações e skills
 *
 * Estrutura do currículo:
 * - `summary`     → resumo profissional em texto livre
 * - `fileUrl`     → URL do arquivo original (PDF, DOCX, etc.)
 * - `rawText`     → texto extraído do arquivo para indexação e busca
 * - `experiences` → lista de experiências profissionais (empresa, cargo, período)
 * - `educations`  → lista de formações acadêmicas (instituição, grau, período)
 * - `skillIds`    → IDs de skills do dicionário normalizado da tabela `skills`
 *
 * Regras de negócio:
 * - Cada candidato possui no máximo um currículo (relação 1:1)
 * - Candidatos com soft delete não podem ter currículo criado ou consultado
 * - A atualização de experiências e formações é destrutiva:
 *   os registros anteriores são removidos e substituídos pelos novos
 * - Skills são vinculadas via tabela intermediária `ResumeSkill`
 *   usando IDs do dicionário de skills normalizado — evita duplicatas
 *   como "Java", "JAVA" e "java" no banco de dados
 *
 * Acesso:
 * - Criação: rota pública (candidatos externos enviam o próprio currículo)
 * - Consulta e atualização: rotas internas (RECRUITER ou ADMIN)
 */
class ResumeService {
  /**
   * Busca o currículo completo de um candidato.
   * Inclui experiências profissionais, formações acadêmicas e skills.
   *
   * Validações aplicadas:
   * - Candidato deve existir e não estar com soft delete ativo
   * - Currículo deve existir para o candidato
   *
   * @param candidateId - UUID do candidato
   * @returns Currículo com experiências, formações e skills incluídos
   * @throws AppError 404 - Candidato não encontrado ou deletado
   * @throws AppError 404 - Currículo não encontrado
   */
  async findByCandidateId(candidateId: string) {
    const candidate = await candidateRepository.findById(candidateId);

    if (!candidate || candidate.deletedAt !== null) {
      throw new AppError('Candidato não encontrado', 404);
    }

    const resume = await resumeRepository.findByCandidateId(candidateId);
    if (!resume) throw new AppError('Currículo não encontrado', 404);
    return resume;
  }

  /**
   * Cria o currículo de um candidato.
   * Um candidato pode ter apenas um currículo — tentativas de criar
   * um segundo currículo retornam erro de conflito.
   *
   * Validações aplicadas:
   * - Candidato deve existir e não estar com soft delete ativo
   * - Candidato não pode ter currículo existente
   *
   * A criação é atômica — experiências, formações e skills são
   * persistidas junto com o currículo em uma única operação no banco.
   *
   * @param candidateId - UUID do candidato
   * @param data        - summary, fileUrl, rawText, skillIds, experiences e educations
   * @returns Currículo criado com todos os relacionamentos incluídos
   * @throws AppError 404 - Candidato não encontrado ou deletado
   * @throws AppError 409 - Candidato já possui um currículo
   */
  async create(candidateId: string, data: CreateResumeDTO) {
    const candidate = await candidateRepository.findById(candidateId);

    if (!candidate || candidate.deletedAt !== null) {
      throw new AppError('Candidato não encontrado', 404);
    }

    const existing = await resumeRepository.findByCandidateId(candidateId);
    if (existing) throw new AppError('Candidato já possui um currículo', 409);

    return resumeRepository.create(candidateId, data);
  }

  /**
   * Atualiza o currículo de um candidato.
   *
   * Atenção — atualização destrutiva para listas:
   * - Experiências profissionais anteriores são removidas e substituídas pelas novas
   * - Formações acadêmicas anteriores são removidas e substituídas pelas novas
   * - Skills anteriores são desvinculadas e substituídas pelas novas
   *
   * Campos individuais como `summary`, `fileUrl` e `rawText`
   * são atualizados incrementalmente (apenas o que for enviado).
   *
   * Validações aplicadas:
   * - Candidato deve existir e não estar com soft delete ativo
   * - Currículo deve existir para o candidato
   *
   * @param candidateId - UUID do candidato
   * @param data        - Campos a atualizar (todos opcionais)
   * @returns Currículo atualizado com todos os relacionamentos incluídos
   * @throws AppError 404 - Candidato não encontrado ou deletado
   * @throws AppError 404 - Currículo não encontrado
   */
  async update(candidateId: string, data: UpdateResumeDTO) {
    const candidate = await candidateRepository.findById(candidateId);

    if (!candidate || candidate.deletedAt !== null) {
      throw new AppError('Candidato não encontrado', 404);
    }

    const resume = await resumeRepository.findByCandidateId(candidateId);
    if (!resume) throw new AppError('Currículo não encontrado', 404);

    return resumeRepository.update(resume.id, data);
  }
}

export default new ResumeService();