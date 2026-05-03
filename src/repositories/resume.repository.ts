import prisma from "../config/client";
import { CreateResumeDTO, UpdateResumeDTO } from "../dto/resume.dto";
import { Skill } from "@prisma/client";

class ResumeRepository {
  findByCandidateId(candidateId: string) {
    return prisma.resume.findUnique({
      where: { candidateId },
      include: {
        experiences: true,
        educations: true,
        skills: {
          include: { skill: true },
        },
      },
    });
  }

  async create(candidateId: string, data: CreateResumeDTO) {
    const {
      skillIds = [],
      experiences = [],
      educations = [],
      ...resumeData
    } = data;

    // ✅ Garantir arrays (evita crash)
    const safeSkillIds = Array.isArray(skillIds) ? skillIds : [];
    const safeExperiences = Array.isArray(experiences) ? experiences : [];
    const safeEducations = Array.isArray(educations) ? educations : [];

    // ✅ Validar skills (foreign key)
    if (safeSkillIds.length > 0) {
      const existingSkills: Skill[] = await prisma.skill.findMany({
        where: { id: { in: safeSkillIds } },
      });

      const existingIds = existingSkills.map((s: Skill) => s.id);

      const invalidIds = safeSkillIds.filter(
        (id: string) => !existingIds.includes(id),
      );

      if (invalidIds.length > 0) {
        throw new Error(
          `As seguintes skills não existem no banco: ${invalidIds.join(", ")}`,
        );
      }
    }

    return prisma.resume.create({
      data: {
        ...resumeData,
        candidateId,

        ...(safeExperiences.length > 0 && {
          experiences: {
            create: safeExperiences.map((exp) => ({
              ...exp,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
            })),
          },
        }),

        ...(safeEducations.length > 0 && {
          educations: {
            create: safeEducations.map((edu) => ({
              ...edu,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
            })),
          },
        }),

        ...(safeSkillIds.length > 0 && {
          skills: {
            create: safeSkillIds.map((skillId: string) => ({
              skillId,
            })),
          },
        }),
      },
    });
  }

  async update(id: string, data: UpdateResumeDTO) {
    const {
      skillIds = [],
      experiences = [],
      educations = [],
      ...resumeData
    } = data;

    const safeSkillIds = Array.isArray(skillIds) ? skillIds : [];
    const safeExperiences = Array.isArray(experiences) ? experiences : [];
    const safeEducations = Array.isArray(educations) ? educations : [];

    return prisma.resume.update({
      where: { id },
      data: {
        ...resumeData,

        ...(safeExperiences.length > 0 && {
          experiences: {
            deleteMany: {},
            create: safeExperiences.map((exp) => ({
              ...exp,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
            })),
          },
        }),

        ...(safeEducations.length > 0 && {
          educations: {
            deleteMany: {},
            create: safeEducations.map((edu) => ({
              ...edu,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
            })),
          },
        }),

        ...(safeSkillIds.length > 0 && {
          skills: {
            deleteMany: {},
            create: safeSkillIds.map((skillId: string) => ({
              skillId,
            })),
          },
        }),
      },
    });
  }
}

export default new ResumeRepository();
