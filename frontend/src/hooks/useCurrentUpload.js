import { useCallback, useEffect, useState } from "react"
import api from "../services/api"

function useCurrentUpload() {
  const [uploads, setUploads] = useState([])
  const [selectedUpload, setSelectedUpload] = useState(null)
  const [selectedUploadId, setSelectedUploadId] = useState("")
  const [filename, setFilename] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refreshUploads = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/uploads/history")
      const uploadHistory = response.data?.uploads || []

      setUploads(uploadHistory)

      if (uploadHistory.length === 0) {
        setSelectedUpload(null)
        setSelectedUploadId("")
        setFilename("")

        localStorage.removeItem("currentUploadId")
        localStorage.removeItem("currentLogFile")
        return
      }

      const savedUploadId =
        localStorage.getItem("currentUploadId")

      let current = uploadHistory.find(
        (upload) =>
          String(upload.id) === String(savedUploadId)
      )

      if (!current) {
        current = uploadHistory[0]
      }

      setSelectedUpload(current)
      setSelectedUploadId(String(current.id))
      setFilename(current.filename)

      localStorage.setItem(
        "currentUploadId",
        String(current.id)
      )

      localStorage.setItem(
        "currentLogFile",
        current.filename
      )
    } catch (err) {
      const detail = err?.response?.data?.detail

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to load upload history."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const changeUpload = useCallback(
    (uploadId) => {
      const upload = uploads.find(
        (item) =>
          String(item.id) === String(uploadId)
      )

      if (!upload) return

      setSelectedUpload(upload)
      setSelectedUploadId(String(upload.id))
      setFilename(upload.filename)

      localStorage.setItem(
        "currentUploadId",
        String(upload.id)
      )

      localStorage.setItem(
        "currentLogFile",
        upload.filename
      )

      window.dispatchEvent(
        new Event("currentUploadChanged")
      )
    },
    [uploads]
  )

  useEffect(() => {
    refreshUploads()
  }, [refreshUploads])

  return {
    uploads,
    selectedUpload,
    selectedUploadId,
    filename,
    loading,
    error,
    refreshUploads,
    changeUpload,
  }
}

export default useCurrentUpload