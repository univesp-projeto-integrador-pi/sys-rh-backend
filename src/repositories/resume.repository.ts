import prisma from "../config/client";
import { CreateResumeDTO, UpdateResumeDTO } from "../dto/resume.dto";

class ResumeRepository {
  findByCandidateId(candidateId: string) {
    return prisma.resume.findUnique({
      where: { candidateId },
      include: {
        experiences: true,
        educations: true,
        skills: {
          include: { skill: true } // resolve o N:M
        }
      }
    });
  }

  create(candidateId: string, data: CreateResumeDTO) {
    const { skillIds, experiences, educations, ...resumeData } = data;

    return prisma.resume.create({
      data: {
        ...resumeData,
        candidateId,
        experiences: { create: experiences },
        educations:  { create: educations },
        skills: {
          create: skillIds.map(skillId => ({ skillId }))
        }
      }
    });
  }

  update(id: string, data: UpdateResumeDTO) {
    const { skillIds, experiences, educations, ...resumeData } = data;

    return prisma.resume.update({
      where: { id },
      data: {
        ...resumeData,
        ...(experiences && { experiences: { deleteMany: {}, create: experiences } }),
        ...(educations  && { educations:  { deleteMany: {}, create: educations  } }),
        ...(skillIds    && { skills: { deleteMany: {}, create: skillIds.map(skillId => ({ skillId })) } })
      }
    });
  }
}

export default new ResumeRepository();