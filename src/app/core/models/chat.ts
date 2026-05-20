export interface Chat {
  chatId:     string;
  propertyId: string;
  ownerId:    number;
  tenantId:   number;
  createdAt:  string;
}

export interface ChatMessage {
  messageId: string;
  chatId:    string;
  senderId:  number;
  content:   string;
  createdAt: string;
  seen:      boolean;
}

export interface StartChatPayload {
  propertyId: string;
}

export interface SendMessagePayload {
  content: string;
}