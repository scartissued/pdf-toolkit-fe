"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { FiArrowRight, FiFileText, FiLoader, FiUpload } from "react-icons/fi"
import { HiOutlineCloudArrowUp } from "react-icons/hi2"
import { Button } from './ui/button'
import ChatPanel from './chat-panel'
import { API_ENDPOINTS, APP_CONFIG, UI_STRINGS } from '@/lib/constants'

const PdfViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-gray-400">
      <FiLoader className="animate-spin" size={32} />
      <span className="ml-2">{UI_STRINGS.LOADING_VIEWER}</span>
    </div>
  ),
})

export default function ChatLayout() {
  const localFileInputRef = useRef<HTMLInputElement>(null)
  const cloudFileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)

  const [fileName, setFileName] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "uploaded" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const resetLocalPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }

  const validateFile = (file: File) => {
    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
      return UI_STRINGS.getFileSizeError(APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024), (file.size / (1024 * 1024)).toFixed(2))
    }

    return null
  }

  const handleLocalUploadClick = () => {
    localFileInputRef.current?.click()
  }

  const handleCloudUploadClick = () => {
    cloudFileInputRef.current?.click()
  }

  const handleLocalFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setErrorMessage(validationError)
      setUploadStatus("error")
      return
    }

    resetLocalPreview()

    const localPreviewUrl = URL.createObjectURL(file)
    previewUrlRef.current = localPreviewUrl

    setFileName(file.name)
    setFileUrl(localPreviewUrl)
    setDocumentId(null)
    setErrorMessage(null)
    setUploadStatus("uploading")

    void uploadLocalFile(file)

    event.target.value = ""
  }

  const uploadLocalFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = (await response.json().catch(() => ({}))) as {
        id?: string
        documentId?: string
        url?: string
        pdfUrl?: string
      }

      setDocumentId(result.documentId ?? result.id ?? null)
      setUploadStatus("uploaded")
      setErrorMessage(null)

      const remoteUrl =
        result.pdfUrl ??
        result.url ??
        UI_STRINGS.getUploadsUrl(file.name)

      if (!previewUrlRef.current) {
        setFileUrl(remoteUrl)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setErrorMessage(UI_STRINGS.ERROR_UPLOAD_FAILED)
    }
  }

  const handleCloudFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setErrorMessage(validationError)
      setUploadStatus("error")
      return
    }

    resetLocalPreview()
    setFileName(file.name)
    setFileUrl(null)
    setDocumentId(null)
    setErrorMessage(null)
    setUploadStatus("uploading")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(API_ENDPOINTS.CLOUD_UPLOAD, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Cloud upload failed")
      }

      const result = await response.json() as { url: string; id: string }
      setFileUrl(UI_STRINGS.getProxyUrl(result.url))
      setDocumentId(result.id)
      setUploadStatus("uploaded")
    } catch (error) {
      console.error("Cloud upload error:", error)
      setUploadStatus("error")
      setErrorMessage(UI_STRINGS.ERROR_CLOUD_UPLOAD_FAILED)
    }

    event.target.value = ""
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 relative">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <div className="relative inline-flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-900"
            >
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span>{UI_STRINGS.BRAND_NAME}</span>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            ref={localFileInputRef}
            className="hidden"
            onChange={handleLocalFileChange}
          />
          <input
            type="file"
            accept=".pdf"
            ref={cloudFileInputRef}
            className="hidden"
            onChange={handleCloudFileChange}
          />
          <Button
            variant="primary"
            icon={uploadStatus === "uploading" ? <FiLoader className="animate-spin" size={16} /> : <FiUpload size={16} />}
            onClick={handleLocalUploadClick}
            disabled={uploadStatus === "uploading"}
          >
            {UI_STRINGS.BTN_UPLOAD}
          </Button>
          <Button
            variant="secondary"
            icon={<HiOutlineCloudArrowUp size={16} />}
            onClick={handleCloudUploadClick}
            disabled={uploadStatus === "uploading"}
          >
            {UI_STRINGS.BTN_CLOUD_UPLOAD}
          </Button>
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 transition-colors">
            {UI_STRINGS.GO_TO_HOMEPAGE}
            <FiArrowRight size={16} />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 min-w-[400px]">
          <PdfViewer fileUrl={fileUrl} />
        </div>

        <div className="w-1/2 min-w-[400px]">
          <ChatPanel
            documentId={documentId ?? undefined}
            uploadStatus={uploadStatus}
            errorMessage={errorMessage}
            fileName={fileName}
            hasFile={Boolean(fileUrl)}
          />
        </div>
      </div>

      {!fileUrl ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-50/70 px-6">
          <div className="pointer-events-auto mx-auto max-w-lg rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
              <FiFileText size={30} />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">{UI_STRINGS.EMPTY_STATE_TITLE}</h2>
            <p className="mb-6 text-sm leading-6 text-gray-500">
              {UI_STRINGS.EMPTY_STATE_DESC}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" icon={<FiUpload size={16} />} onClick={handleLocalUploadClick}>
                {UI_STRINGS.BTN_UPLOAD_PDF}
              </Button>
              <Button variant="secondary" icon={<HiOutlineCloudArrowUp size={16} />} onClick={handleCloudUploadClick}>
                {UI_STRINGS.BTN_UPLOAD_TO_CLOUD}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
