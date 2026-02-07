import axios, { AxiosHeaders } from 'axios'
import {
  MissingAuthTokenError,
  getAuthorizationHeaderValue,
} from '../auth/authToken'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 7_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const authHeader = getAuthorizationHeaderValue()
  if (!authHeader) {
    return Promise.reject(new MissingAuthTokenError())
  }

  const headers = AxiosHeaders.from(config.headers)
  headers.set('Authorization', authHeader)
  config.headers = headers

  return config
})
