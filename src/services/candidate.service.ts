import { CreateCandidateDTO, UpdateCandidateDTO } from "../dto/candidate.dto";
import candidateRepository from "../repositories/candidate.repository";
import { AppError } from "../middlewares/errorHandler.middleware";

class CandidateService {
  async findAll() {
    return candidateRepository.findAll();
  }

  async findById(id: string) {
    const candidate = await candidateRepository.findById(id);
    if (!candidate) throw new AppError("Candidato não encontrado", 404);
    return candidate;
  }

  async findByEmail(email: string) {
    const candidate = await candidateRepository.findByEmail(email);
    return candidate; // Se não existir, retorna null. O Controller cuidará do 404.
  }

  async create(data: any) {
    // 🔍 LOG DE INSPEÇÃO PROFUNDA
    console.log("-------------------------------------------------");
    console.log(
      "⚙️ [SERVICE] Chaves recebidas no objeto 'data':",
      Object.keys(data),
    );
    console.log("⚙️ [SERVICE] Conteúdo bruto de 'education':", data.education);

    const existing = await candidateRepository.findByEmail(data.email);
    if (existing)
      throw new AppError(
        "Você já possui um perfil de candidato cadastrado.",
        409,
      );

    // VERIFICAÇÃO À PROVA DE BALAS:
    // Checa se 'education' existe, se é um objeto e se tem a instituição (mesmo que vazia)
    const hasEducationData = !!(
      data.education &&
      typeof data.education === "object" &&
      (data.education.institution || data.education.degree)
    );

    if (hasEducationData) {
      console.log("✅ [SERVICE] Rota detectada: createWithEducation()");
      return candidateRepository.createWithEducation(data);
    }

    console.log("⚠️ [SERVICE] Rota detectada: create() simples (sem educação)");
    return candidateRepository.create(data);
  }

  async update(id: string, data: UpdateCandidateDTO) {
    await this.findById(id);
    return candidateRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return candidateRepository.softDelete(id);
  }
}

export default new CandidateService();
