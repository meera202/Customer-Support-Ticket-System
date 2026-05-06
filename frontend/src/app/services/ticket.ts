import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export interface TicketItem {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | string;
  createdAt: string;
  customerId?: string | null;
  assignedAgent?: string | null;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AssignPayload {
  ticketId: string;
  agentName: string;
}

export interface RespondPayload {
  ticketId: string;
  response: string;
}

export interface NotificationPayload {
  ticketId: string;
  message: string;
  customerId: string;
  subject?: string;
  fromAgent?: string;
}

export interface NotificationRecord {
  _id: string;
  customerId: string;
  ticketId?: string | null;
  message: string;
  subject: string;
  fromAgent?: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly ticketBaseUrl = '/api/tickets';
  private readonly supportBaseUrl = '/support';
  private readonly notificationBaseUrl = '/api';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<TicketItem[]> {
    return this.http.get<TicketItem[]>(this.ticketBaseUrl).pipe(timeout(10000));
  }

  createTicket(data: CreateTicketPayload): Observable<TicketItem> {
    return this.http.post<TicketItem>(this.ticketBaseUrl, data).pipe(timeout(10000));
  }

  updateTicket(id: string, data: Partial<TicketItem>): Observable<TicketItem> {
    return this.http
      .put<TicketItem>(`${this.ticketBaseUrl}/${id}`, data)
      .pipe(timeout(10000));
  }

  deleteTicket(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.ticketBaseUrl}/${id}`)
      .pipe(timeout(10000));
  }

  assignTicket(payload: AssignPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.supportBaseUrl}/assign`, payload);
  }

  respondToTicket(payload: RespondPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.supportBaseUrl}/respond`, payload);
  }

  sendNotification(
    payload: NotificationPayload
  ): Observable<{ message: string; notification?: NotificationRecord }> {
    return this.http.post<{ message: string; notification?: NotificationRecord }>(
      `${this.notificationBaseUrl}/notify`,
      payload
    );
  }

  getNotifications(): Observable<NotificationRecord[]> {
    return this.http.get<NotificationRecord[]>(
      `${this.notificationBaseUrl}/notifications`
    );
  }
}
