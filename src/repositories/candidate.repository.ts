import prisma from "../config/client";
import { CreateCandidateDTO, UpdateCandidateDTO } from "../dto/candidate.dto";

class CandidateRepository {
  async findAll() {
    return prisma.candidate.findMany({
      where: { deletedAt: null },
      include: {
        resume: {
          include: {
            educations: true
          }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        resume: {
          include: {
            educations: true
          }
        },
        internalProfile: true
      }
    });
  }

  // 🚀 CORREÇÃO AQUI: Adicionado 'include' para que o Service/Frontend 
  // saiba que o currículo e educação existem ao buscar pelo e-mail (usado na Home).
  async findByEmail(email: string) {
    return prisma.candidate.findUnique({ 
      where: { email },
      include: {
        resume: {
          include: {
            educations: true
          }
        }
      }
    });
  }

  async create(data: CreateCandidateDTO) {
    console.log("⚠️ [REPO] Executando create() simples.");
    return prisma.candidate.create({ data });
  }

  async createWithEducation(data: any) {
    console.log("🚀 [REPO] Iniciando transação createWithEducation");

    const edu = data.education || {};
    
    try {
      // Garantimos que as datas sejam objetos Date válidos ou null
      const safeStartDate = edu.startDate ? new Date(edu.startDate) : new Date();
      const safeEndDate = edu.endDate ? new Date(edu.endDate) : null;

      const result = await prisma.candidate.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          resume: {
            create: {
              educations: {
                create: {
                  institution: String(edu.institution || "Não informada"),
                  degree: String(edu.degree || "Não informado"),
                  fieldOfStudy: String(edu.fieldOfStudy || "Não informado"),
                  startDate: isNaN(safeStartDate.getTime()) ? new Date() : safeStartDate,
                  endDate: (safeEndDate && !isNaN(safeEndDate.getTime())) ? safeEndDate : null,
                }
              }
            }
          }
        },
        include: {
          resume: {
            include: {
              educations: true
            }
          }
        }
      });

      console.log("✅ [REPO] Registro completo inserido com sucesso!");
      return result;

    } catch (error: any) {
      console.error("❌ [REPO] Falha crítica no Prisma:", error.message);
      throw error;
    }
  }

  async update(id: string, data: UpdateCandidateDTO) {
    return prisma.candidate.update({ 
      where: { id }, 
      data,
      include: {
        resume: true
      }
    });
  }

  async softDelete(id: string) {
    return prisma.candidate.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export default new CandidateRepository();