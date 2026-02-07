import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getAuthorizationHeaderValueMock } = vi.hoisted(() => ({
  getAuthorizationHeaderValueMock: vi.fn<() => string | null>(),
}))

vi.mock('../auth/authToken', () => ({
  MissingAuthTokenError: class MissingAuthTokenError extends Error {
    constructor() {
      super('LCD 인증 토큰이 없어 요청을 진행할 수 없습니다.')
      this.name = 'MissingAuthTokenError'
    }
  },
  getAuthorizationHeaderValue: getAuthorizationHeaderValueMock,
}))

import { httpClient } from './httpClient'

type InterceptorRegistry = {
  handlers: Array<{
    fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  }>
}

describe('httpClient request interceptor', () => {
  beforeEach(() => {
    getAuthorizationHeaderValueMock.mockReset()
  })

  it('토큰이 없으면 MissingAuthTokenError로 요청을 차단한다', async () => {
    getAuthorizationHeaderValueMock.mockReturnValue(null)
    const handlers = (httpClient.interceptors.request as unknown as InterceptorRegistry).handlers
    const interceptor = handlers[handlers.length - 1]?.fulfilled

    await expect(
      interceptor?.({ headers: {} } as InternalAxiosRequestConfig),
    ).rejects.toMatchObject({
      name: 'MissingAuthTokenError',
    })
  })

  it('토큰이 있으면 Authorization 헤더를 주입한다', async () => {
    getAuthorizationHeaderValueMock.mockReturnValue('Bearer test-token')
    const handlers = (httpClient.interceptors.request as unknown as InterceptorRegistry).handlers
    const interceptor = handlers[handlers.length - 1]?.fulfilled

    const result = await interceptor?.({
      headers: {},
    } as InternalAxiosRequestConfig)

    expect(result?.headers).toBeInstanceOf(AxiosHeaders)
    expect((result?.headers as AxiosHeaders).get('Authorization')).toBe('Bearer test-token')
  })
})
