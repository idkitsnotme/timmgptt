export type Role = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
  images?: string[]; // base64 strings
}

export interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading: boolean; // waiting for first byte
}

export interface ImageAttachment {
  data: string; // base64
  mimeType: string;
}
