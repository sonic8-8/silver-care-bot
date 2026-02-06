export type AuthRole = 'WORKER' | 'FAMILY' | 'ROBOT';

export interface AuthUser {
    id: number;
    role: AuthRole;
    email?: string;
    elderId?: number;
}
