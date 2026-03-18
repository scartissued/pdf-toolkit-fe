"use client"

import { useEffect, useRef, useState } from "react"
import { FiMessageSquare, FiUser } from "react-icons/fi"
import { HiOutlineSparkles } from "react-icons/hi2"
import ChatInput from './chat-input'
import { API_ENDPOINTS, APP_CONFIG, UI_STRINGS } from '@/lib/constants'

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface ChatPanelProps {
  documentId?: string;
  uploadStatus: 'idle' | 'uploading' | 'uploaded' | 'error';
  errorMessage?: string | null;
  fileName?: string | null;
  hasFile: boolean;
}

export default function ChatPanel({
  documentId,
  uploadStatus,
  errorMessage,
  fileName,
  hasFile,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [documentStatus, setDocumentStatus] = useState<'idle' | 'processing' | 'processed' | 'error'>(
    documentId ? 'processing' : uploadStatus === 'error' ? 'error' : 'idle'
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const queueScrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  useEffect(() => {
    if (uploadStatus === 'error') {
      setDocumentStatus('error')
      return
    }

    if (uploadStatus === 'uploading') {
      setDocumentStatus('processing')
      return
    }

    if (!documentId) {
      setDocumentStatus('idle')
      return
    }

    let cancelled = false
    let timer: number | null = null

    const poll = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.DOCUMENTS}/${documentId}`, {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error(UI_STRINGS.ERROR_CHECK_STATUS_FAILED)
        }
        const data = await response.json() as { status: string }
        const status = data.status === 'processed' || data.status === 'error' ? data.status : 'processing'
        if (!cancelled) {
          setDocumentStatus(status)
        }
        if (!cancelled && status === 'processing') {
          timer = window.setTimeout(poll, APP_CONFIG.POLL_INTERVAL)
        }
      } catch {
        if (!cancelled) {
          setDocumentStatus('error')
        }
      }
    }

    setDocumentStatus('processing')
    void poll()

    return () => {
      cancelled = true
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [documentId, uploadStatus])

  const handleSendMessage = async (text: string) => {
    const newUserMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, newUserMessage])
    queueScrollToBottom()
    setIsLoading(true)

    try {
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: text, document_id: documentId }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(UI_STRINGS.ERROR_GET_ANSWER_FAILED)
      }

      const data = await response.json() as { answer: string; sources: string[] }
      const newAiMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }
      setMessages(prev => [...prev, newAiMessage])
      queueScrollToBottom()
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: UI_STRINGS.ERROR_CHAT_REQUEST_FAILED
      }])
      queueScrollToBottom()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-400">
              <FiMessageSquare size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {documentStatus === 'processing'
                ? UI_STRINGS.CHAT_PROCESSING_TITLE
                : documentStatus === 'error'
                  ? UI_STRINGS.CHAT_FAILED_TITLE
                  : hasFile
                    ? UI_STRINGS.CHAT_AVAILABLE_TITLE
                    : UI_STRINGS.CHAT_UPLOAD_PROMPT_TITLE}
            </h3>
            <p className="max-w-sm">
              {documentStatus === 'processing'
                ? UI_STRINGS.CHAT_PROCESSING_DESC
                : documentStatus === 'error'
                  ? errorMessage ?? UI_STRINGS.CHAT_DEFAULT_ERROR_DESC
                  : hasFile
                    ? UI_STRINGS.getChatPrompt(fileName ?? 'your PDF document')
                    : UI_STRINGS.CHAT_CHOOSE_PDF_DESC}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                  {msg.role === 'user' ? <FiUser size={16} /> : <HiOutlineSparkles size={16} />}
                </div>

                <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading || documentStatus === 'processing' || !documentId}
      />
    </div>
  )
}
