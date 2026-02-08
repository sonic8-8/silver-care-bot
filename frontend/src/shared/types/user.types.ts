export type UserRole = 'WORKER' | 'FAMILY';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
}

export interface AuthUserProfile {
    id: number;
    name?: string;
    email?: string;
    role: UserRole;
    phone?: string;
    elderId?: number;
}

export interface AuthRobotProfile {
    id: number;
    serialNumber: string;
    elderId?: number;
    elderName?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    user?: AuthUserProfile;
    robot?: AuthRobotProfile;
}
