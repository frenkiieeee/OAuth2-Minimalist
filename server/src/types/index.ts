export enum AuthMethod {
  GOOGLE = 'GOOGLE',
  EMAIL = 'EMAIL',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  name: string | null;
  avatar: string | null;
  authMethod: AuthMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userId: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  authMethod: AuthMethod;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface OAuthState {
  state: string;
  codeVerifier: string;
  createdAt: Date;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

export type DatabaseAdapter = {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: {
    email: string;
    passwordHash?: string;
    name?: string;
    avatar?: string;
    authMethod: AuthMethod;
  }): Promise<User>;
  createRefreshToken(token: string, userId: string, expiresAt: Date): Promise<RefreshToken>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
};