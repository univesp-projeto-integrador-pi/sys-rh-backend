import prisma from '../config/client';

class RefreshTokenRepository {
  async create(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { 
        userId, 
        token, 
        expiresAt 
      }
    });
  }

  async findByToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      },
      include: { 
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            name: true
          }
        } 
      }
    });
  }

  async deleteByToken(token: string) {
    return prisma.refreshToken.deleteMany({ 
      where: { token } 
    });
  }

  async deleteAllByUserId(userId: string) {
    return prisma.refreshToken.deleteMany({ 
      where: { userId } 
    });
  }

  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { 
        expiresAt: { lt: new Date() } 
      }
    });
  }
}

export default new RefreshTokenRepository();