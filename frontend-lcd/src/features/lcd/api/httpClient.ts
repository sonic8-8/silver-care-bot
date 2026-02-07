import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 7_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

