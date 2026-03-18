export const APP_CONFIG = {
  MAX_FILE_SIZE: 6 * 1024 * 1024,
  POLL_INTERVAL: 1500,
  MAX_CHARS: 1000,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/upload`,
  CLOUD_UPLOAD: `${API_BASE_URL}/upload/cloud`,
  DOCUMENTS: `${API_BASE_URL}/documents`,
  CHAT: `${API_BASE_URL}/chat`,
  PROXY_PDF: `${API_BASE_URL}/proxy-pdf?url=`,
  UPLOADS_BASE: `${API_BASE_URL}/uploads/`,
};

export const UI_STRINGS = {
  BRAND_NAME: "PDFHelper",
  
  // Layout & Navigation
  GO_TO_HOMEPAGE: "Go to homepage",
  
  // Upload & File
  BTN_UPLOAD: "Upload",
  BTN_CLOUD_UPLOAD: "Cloud Upload",
  BTN_UPLOAD_PDF: "Upload PDF",
  BTN_UPLOAD_TO_CLOUD: "Upload to Cloud",
  
  // Viewer
  LOADING_VIEWER: "Loading Viewer...",
  LOADING_PDF: "Loading PDF...",
  LOAD_PDF_FAILED: "Failed to load PDF.",
  NO_PDF_TITLE: "No PDF loaded",
  NO_PDF_DESC: "Upload a document to view it here.",
  
  // Chat Input
  CHAT_INPUT_PLACEHOLDER: "Ask a question about your document...",
  ARIA_ADD_ATTACHMENT: "Add attachment",
  ARIA_SEND_MESSAGE: "Send message",
  CHARACTERS_SUFFIX: "characters",
  
  // Chat Panel Empty States
  CHAT_PROCESSING_TITLE: "Document is processing",
  CHAT_PROCESSING_DESC: "Your PDF is being indexed in the background. Chat unlocks when processing finishes.",
  CHAT_FAILED_TITLE: "Upload failed",
  CHAT_DEFAULT_ERROR_DESC: "There was a problem uploading your PDF.",
  CHAT_AVAILABLE_TITLE: "Chat available",
  CHAT_UPLOAD_PROMPT_TITLE: "Upload a PDF",
  CHAT_CHOOSE_PDF_DESC: "Choose a PDF to start chatting with it.",
  
  // Empty State Layout
  EMPTY_STATE_TITLE: "Start a PDF conversation",
  EMPTY_STATE_DESC: "Choose a PDF to render it instantly in the viewer. Upload and indexing will continue in the background.",
  
  // Errors
  ERROR_UPLOAD_FAILED: "Upload failed. Please try again.",
  ERROR_CLOUD_UPLOAD_FAILED: "Cloud upload failed. Please try again.",
  ERROR_CHAT_REQUEST_FAILED: "Sorry, I encountered an error while processing your request. Please try again.",
  ERROR_CHECK_STATUS_FAILED: "Failed to check document status",
  ERROR_GET_ANSWER_FAILED: "Failed to get answer",
  
  // Dynamic String Builders
  getFileSizeError: (maxSizeMB: number, actualSizeMB: string | number) => 
    `File size exceeds the limit of ${maxSizeMB}MB. This file is ${actualSizeMB}MB.`,
  getChatPrompt: (fileName: string) => `Ask a question about ${fileName}.`,
  getProxyUrl: (url: string) => `${API_ENDPOINTS.PROXY_PDF}${encodeURIComponent(url)}`,
  getUploadsUrl: (fileName: string) => `${API_ENDPOINTS.UPLOADS_BASE}${encodeURIComponent(fileName)}`,
};
