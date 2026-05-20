import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Chat, ChatMessage, StartChatPayload, SendMessagePayload } from '../models/chat';

@Injectable({ providedIn: 'root' })
export class ChatService {

  private readonly BASE = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  startChat(payload: StartChatPayload): Observable<Chat> {
    return this.http.post<Chat>(`${this.BASE}/start`, payload);
  }

  getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.BASE}/list`);
  }

  getChatById(chatId: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.BASE}/${chatId}`);
  }

  getMessages(chatId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.BASE}/${chatId}/messages`);
  }

  sendMessage(chatId: string, payload: SendMessagePayload): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.BASE}/${chatId}/messages`, payload);
  }

  markAsSeen(chatId: string): Observable<void> {
    return this.http.put<void>(`${this.BASE}/${chatId}/seen`, {});
  }
}