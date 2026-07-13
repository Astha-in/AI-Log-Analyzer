import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import api from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setUser(null)
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.get("/auth/me")
      setUser(response.data)
    } catch (error) {
      console.error("CURRENT USER ERROR:", error)
      clearAuth()
    } finally {
      setLoading(false)
    }
  }, [clearAuth])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const login = useCallback(async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    })

    const {
      access_token,
      refresh_token,
      user: authenticatedUser,
    } = response.data

    localStorage.setItem("accessToken", access_token)
    localStorage.setItem("refreshToken", refresh_token)

    if (authenticatedUser) {
      setUser(authenticatedUser)
    } else {
      const userResponse = await api.get("/auth/me")
      setUser(userResponse.data)
    }

    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("LOGOUT ERROR:", error)
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      fetchCurrentUser,
    }),
    [
      user,
      loading,
      login,
      logout,
      fetchCurrentUser,
    ]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    )
  }

  return context
}

export default AuthContext