import { AuthTokens } from '@/types';

const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
let origin = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
if (origin.endsWith('/api/v1')) {
    origin = origin.substring(0, origin.length - 7);
}
// Double check for trailing slash after removal
if (origin.endsWith('/')) {
    origin = origin.slice(0, -1);
}
const DEFAULT_ORIGIN = origin;

class APIClient {
    private origin: string;

    constructor() {
        this.origin = DEFAULT_ORIGIN;
    }

    private getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem('accessToken');
    }

    private getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem('refreshToken');
    }

    setTokens({ accessToken, refreshToken }: AuthTokens): void {
        if (typeof window === 'undefined') return;
        if (accessToken) sessionStorage.setItem('accessToken', accessToken);
        if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
    }

    clearTokens(): void {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
    }

    private async parseJsonSafe(response: Response): Promise<any> {
        const text = await response.text();
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch {
            return null;
        }
    }

    private async refresh(): Promise<string | null> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return null;

        const response = await fetch(`${this.origin}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return null;

        const payload = await response.json();
        const tokens = payload?.data;
        if (!tokens?.accessToken) return null;
        this.setTokens(tokens);
        return tokens.accessToken;
    }

    async request<T = any>(
        path: string,
        options: {
            method?: string;
            headers?: Record<string, string>;
            body?: any;
            auth?: boolean;
            retryOnAuthFailure?: boolean;
        } = {}
    ): Promise<T> {
        const {
            method = 'GET',
            headers = {},
            body,
            auth = false,
            retryOnAuthFailure = true,
        } = options;

        const url = `${this.origin}/api/v1${path.startsWith('/') ? '' : '/'}${path}`;
        console.log(`📡 API Request: ${method} ${url}`); // Debug Log

        const finalHeaders: Record<string, string> = { ...headers };

        if (body !== undefined && !(body instanceof FormData)) {
            finalHeaders['Content-Type'] = 'application/json';
        }

        if (auth) {
            const token = this.getAccessToken();
            if (token) finalHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method,
            headers: finalHeaders,
            body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
        });

        if (response.status === 401 && auth && retryOnAuthFailure) {
            const newToken = await this.refresh();
            if (newToken) {
                return this.request(path, { ...options, retryOnAuthFailure: false });
            }
        }

        if (!response.ok) {
            const data = await this.parseJsonSafe(response);
            const message =
                data?.error?.message || data?.message || `Request failed (${response.status})`;
            const error: any = new Error(message);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        const json = await this.parseJsonSafe(response);
        return json;
    }

    async download(path: string, filename: string): Promise<void> {
        const url = `${this.origin}/api/v1${path.startsWith('/') ? '' : '/'}${path}`;
        const headers: Record<string, string> = {};
        const token = this.getAccessToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) throw new Error(`Download failed (${response.status})`);

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        a.remove();
    }
}

export const API = new APIClient();
