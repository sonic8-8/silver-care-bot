export interface JwtPayload {
    sub: string;
    role?: string;
    email?: string;
    elderId?: number;
    exp?: number;
    [key: string]: unknown;
}

const decodeBase64 = (value: string): string => {
    if (typeof atob === 'function') {
        return atob(value);
    }
    throw new Error('Base64 decoder not available');
};

export const parseJwtPayload = (token: string | null | undefined): JwtPayload | null => {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
        const base64Url = parts[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }
        const jsonPayload = decodeURIComponent(
            decodeBase64(base64)
                .split('')
                .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
                .join('')
        );
        const data = JSON.parse(jsonPayload) as JwtPayload;
        if (!data.sub) return null;
        return data;
    } catch {
        return null;
    }
};
