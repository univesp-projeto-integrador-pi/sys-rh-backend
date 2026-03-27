import prisma from '../config/client';

class RefreshTokenRepository {
  create(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt }
    });
  }

  findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });
  }

  deleteByToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  }

  deleteAllByUserId(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }
}

export default new RefreshTokenRepository();