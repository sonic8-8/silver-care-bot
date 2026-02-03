export type UserRole = 'WORKER' | 'FAMILY';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}
