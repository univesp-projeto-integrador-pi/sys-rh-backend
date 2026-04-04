import prisma from '../config/client';

class RefreshTokenRepository {
  create(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt }
    });
  }

  findByToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });
  }

  deleteByToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  }

  deleteAllByUserId(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }

  deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
  }
}

export default new RefreshTokenRepository();