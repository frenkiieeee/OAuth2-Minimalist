import { PrismaClient } from '@prisma/client';

export class PostgresAdapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: {
    email: string;
    passwordHash?: string;
    name?: string;
    avatar?: string;
    authMethod: 'GOOGLE' | 'EMAIL';
  }) {
    return this.prisma.user.create({ data });
  }

  async createRefreshToken(token: string, userId: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string) {
    return this.prisma.refreshToken.delete({ where: { token } });
  }

  async deleteUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}