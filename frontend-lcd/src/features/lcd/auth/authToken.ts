const QUERY_TOKEN_KEY = 'token'
const SESSION_TOKEN_KEY = 'lcd-auth-token'
const LOCAL_TOKEN_KEYS = ['lcd-auth-token', 'accessToken', 'token']

export class MissingAuthTokenError extends Error {
  constructor() {
    super('LCD 인증 토큰이 없어 요청을 진행할 수 없습니다.')
    this.name = 'MissingAuthTokenError'
  }
}

function readQueryToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const token = new URLSearchParams(window.location.search).get(QUERY_TOKEN_KEY)
  if (!token?.trim()) {
    return null
  }

  return token.trim()
}

function readSessionToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const token = window.sessionStorage.getItem(SESSION_TOKEN_KEY)
  return token?.trim() ? token.trim() : null
}

function readLocalStorageToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  for (const key of LOCAL_TOKEN_KEYS) {
    const token = window.localStorage.getItem(key)
    if (token?.trim()) {
      return token.trim()
    }
  }

  return null
}

function readEnvToken(): string | null {
  const token = import.meta.env.VITE_LCD_AUTH_TOKEN
  if (typeof token !== 'string') {
    return null
  }

  return token.trim() ? token.trim() : null
}

function persistSessionToken(token: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(SESSION_TOKEN_KEY, token)
}

export function getAuthToken(): string | null {
  const queryToken = readQueryToken()
  if (queryToken) {
    persistSessionToken(queryToken)
    return queryToken
  }

  return readSessionToken() ?? readLocalStorageToken() ?? readEnvToken()
}

export function getAuthorizationHeaderValue(): string | null {
  const token = getAuthToken()
  return token ? `Bearer ${token}` : null
}

export function appendTokenQuery(endpoint: string, token: string): string {
  const separator = endpoint.includes('?') ? '&' : '?'
  return `${endpoint}${separator}${QUERY_TOKEN_KEY}=${encodeURIComponent(token)}`
}

export function isMissingAuthTokenError(error: unknown): boolean {
  return error instanceof MissingAuthTokenError
}

