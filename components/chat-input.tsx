"use client"

import { KeyboardEvent, useState } from "react"
import { FiLoader, FiPaperclip, FiSend } from "react-icons/fi"
import { Button } from './ui/button'
import { APP_CONFIG, UI_STRINGS } from '@/lib/constants'

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-transparent transition-all">
        <button
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={UI_STRINGS.ARIA_ADD_ATTACHMENT}
          disabled={isLoading}
        >
          <FiPaperclip size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={UI_STRINGS.CHAT_INPUT_PLACEHOLDER}
          disabled={isLoading}
          className="flex-1 bg-transparent py-3 px-2 text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
        />
        <div className="p-2">
          <Button
            variant="primary"
            size="sm"
            className="h-8 w-8 !p-0 rounded-full"
            aria-label={UI_STRINGS.ARIA_SEND_MESSAGE}
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? <FiLoader size={16} className="animate-spin" /> : <FiSend size={16} />}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-end mt-2 px-1">
        <span className="text-xs text-gray-400">{message.length}/{APP_CONFIG.MAX_CHARS} {UI_STRINGS.CHARACTERS_SUFFIX}</span>
      </div>
    </div>
  )
}
