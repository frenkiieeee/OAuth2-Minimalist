import { AuthMethod, DatabaseAdapter, RefreshToken, User } from '../types/index.js';

export class MemoryAdapter implements DatabaseAdapter {
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, RefreshToken> = new Map();

  async findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(data: {
    email: string;
    passwordHash?: string;
    name?: string;
    avatar?: string;
    authMethod: AuthMethod;
  }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      passwordHash: data.passwordHash || null,
      name: data.name || null,
      avatar: data.avatar || null,
      authMethod: data.authMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async createRefreshToken(
    token: string,
    userId: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    const refreshToken: RefreshToken = {
      id: crypto.randomUUID(),
      token,
      expiresAt,
      createdAt: new Date(),
      userId,
    };
    this.refreshTokens.set(token, refreshToken);
    return refreshToken;
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokens.get(token) || null;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    this.refreshTokens.delete(token);
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    for (const [token, rt] of this.refreshTokens.entries()) {
      if (rt.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }
  }
}