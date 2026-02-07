import { beforeEach, describe, expect, it } from 'vitest'
import {
  MissingAuthTokenError,
  appendTokenQuery,
  getAuthToken,
  getAuthorizationHeaderValue,
  isMissingAuthTokenError,
} from './authToken'

const env = import.meta.env as Record<string, string | undefined>
const originalEnvToken = env.VITE_LCD_AUTH_TOKEN

function setQueryToken(token: string | null) {
  const suffix = token ? `?token=${encodeURIComponent(token)}` : ''
  window.history.replaceState({}, '', `/${suffix}`)
}

describe('authToken', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    env.VITE_LCD_AUTH_TOKEN = originalEnvToken
    setQueryToken(null)
  })

  it('query token을 최우선으로 사용하고 sessionStorage에 저장한다', () => {
    setQueryToken('query-token')

    const token = getAuthToken()

    expect(token).toBe('query-token')
    expect(window.sessionStorage.getItem('lcd-auth-token')).toBe('query-token')
  })

  it('query token이 없으면 session/local/env 순서로 조회한다', () => {
    window.sessionStorage.setItem('lcd-auth-token', 'session-token')
    window.localStorage.setItem('accessToken', 'local-token')
    env.VITE_LCD_AUTH_TOKEN = 'env-token'

    expect(getAuthToken()).toBe('session-token')

    window.sessionStorage.clear()
    expect(getAuthToken()).toBe('local-token')

    window.localStorage.clear()
    expect(getAuthToken()).toBe('env-token')
  })

  it('빈 토큰 값은 무시하고 null을 반환한다', () => {
    setQueryToken('   ')
    window.sessionStorage.setItem('lcd-auth-token', '   ')
    window.localStorage.setItem('accessToken', ' ')
    env.VITE_LCD_AUTH_TOKEN = '   '

    expect(getAuthToken()).toBeNull()
    expect(getAuthorizationHeaderValue()).toBeNull()
  })

  it('Authorization 헤더를 Bearer 형식으로 생성한다', () => {
    window.localStorage.setItem('token', 'local-token')

    expect(getAuthorizationHeaderValue()).toBe('Bearer local-token')
  })

  it('appendTokenQuery는 기존 쿼리 여부에 맞춰 token 파라미터를 추가한다', () => {
    expect(appendTokenQuery('/ws', 'abc')).toBe('/ws?token=abc')
    expect(appendTokenQuery('/ws?robotId=1', 'abc')).toBe('/ws?robotId=1&token=abc')
  })

  it('MissingAuthTokenError 타입 가드를 제공한다', () => {
    expect(isMissingAuthTokenError(new MissingAuthTokenError())).toBe(true)
    expect(isMissingAuthTokenError(new Error('other'))).toBe(false)
  })
})
