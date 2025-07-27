import axios from 'axios';
import {from, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {Credential} from '../models/Credential';
import {AuthenticationToken} from '../models/AuthenticationToken';

export class AuthService {
    private static readonly TOKEN_KEY = 'user_token';
    private static readonly REFRESH_KEY = 'token_refresh';
    private static readonly EXPIRES_AT_KEY = 'expires_at';
    private static readonly TENANT_URL_KEY = 'tenant_url';

    setTenantUrl(url: string): void {
        localStorage.setItem(AuthService.TENANT_URL_KEY, url);
    }

    getTenantUrl(): string {
        return localStorage.getItem(AuthService.TENANT_URL_KEY) || '';
    }

    login$(credentials: Credential): Observable<AuthenticationToken> {
        const url = `${this.getTenantUrl()}/api-v1/auth`;
        return from(axios.post<AuthenticationToken>(url, credentials)).pipe(
            map((res) => res.data),
            tap((token) => this.saveAuthInfo(token))
        );
    }

    private saveAuthInfo(authToken: AuthenticationToken): void {
        localStorage.setItem(AuthService.TOKEN_KEY, authToken.token);
        localStorage.setItem(AuthService.REFRESH_KEY, authToken.refreshToken);
        localStorage.setItem(AuthService.EXPIRES_AT_KEY, authToken.expiredAt.toString());
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem(AuthService.TOKEN_KEY);
    }

    isTokenValid(): boolean {
        const expires = localStorage.getItem(AuthService.EXPIRES_AT_KEY);
        if (!expires) {
            return false;
        }
        return Date.now() < parseInt(expires, 10);
    }

    logout(): void {
        localStorage.removeItem(AuthService.TOKEN_KEY);
        localStorage.removeItem(AuthService.REFRESH_KEY);
        localStorage.removeItem(AuthService.EXPIRES_AT_KEY);
    }
}
