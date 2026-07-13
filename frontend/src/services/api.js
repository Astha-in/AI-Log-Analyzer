import axios from "axios"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
})

let isRefreshing = false
let refreshQueue = []

const processRefreshQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  refreshQueue = []
}

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken =
        localStorage.getItem("refreshToken")

      if (!refreshToken) {
        throw new Error("Refresh token unavailable")
      }

      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {
          refresh_token: refreshToken,
        }
      )

      const newAccessToken = response.data.access_token

      localStorage.setItem(
        "accessToken",
        newAccessToken
      )

      if (response.data.refresh_token) {
        localStorage.setItem(
          "refreshToken",
          response.data.refresh_token
        )
      }

      processRefreshQueue(null, newAccessToken)

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      processRefreshQueue(refreshError)

      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")

      if (window.location.pathname !== "/login") {
        window.location.replace("/login")
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api