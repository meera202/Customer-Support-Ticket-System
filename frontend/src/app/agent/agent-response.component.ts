import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TicketItem, TicketService } from '../services/ticket';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-agent-response',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-response.component.html',
  styleUrls: ['../shared/dashboard-shared.css', './agent-response.component.css'],
})
export class AgentResponseComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly auth = inject(AuthService);

  tickets: TicketItem[] = [];
  selectedTicketId = '';
  assignment = { agentName: '' };
  response = { text: '' };
  notificationText = '';
  statusMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: () => {
        this.errorMessage = 'Unable to load tickets.';
      },
    });
  }

  assignTicket(): void {
    if (!this.selectedTicketId || !this.assignment.agentName.trim()) {
      this.errorMessage = 'Select a ticket and enter an agent name.';
      return;
    }
    this.errorMessage = '';
    this.ticketService
      .assignTicket({
        ticketId: this.selectedTicketId,
        agentName: this.assignment.agentName.trim(),
      })
      .pipe(
        switchMap(() =>
          this.ticketService.updateTicket(this.selectedTicketId, {
            assignedAgent: this.assignment.agentName.trim(),
          })
        )
      )
      .subscribe({
        next: () => {
          this.statusMessage = 'Assignment recorded and ticket updated.';
          this.loadTickets();
        },
        error: () => {
          this.errorMessage = 'Assignment or ticket update failed.';
        },
      });
  }

  sendResponse(): void {
    if (!this.selectedTicketId || !this.response.text.trim()) {
      this.errorMessage = 'Select a ticket and add a response.';
      return;
    }
    const ticket = this.tickets.find((t) => t._id === this.selectedTicketId);
    if (!ticket) {
      this.errorMessage = 'Ticket not found. Refresh the list and try again.';
      return;
    }
    const responseBody = this.response.text.trim();
    this.errorMessage = '';
    this.ticketService
      .respondToTicket({
        ticketId: this.selectedTicketId,
        response: responseBody,
      })
      .pipe(
        switchMap(() =>
          ticket.customerId
            ? this.ticketService
                .sendNotification({
                  ticketId: ticket._id,
                  customerId: ticket.customerId,
                  message: responseBody,
                  subject: this.buildNotificationSubject(ticket),
                  fromAgent: this.auth.getUser()?.username,
                })
                .pipe(map(() => true))
            : of(false)
        )
      )
      .subscribe({
        next: (sentToCustomer) => {
          this.statusMessage = sentToCustomer
            ? 'Response logged and sent to the customer (notification saved).'
            : 'Response logged on support service. This ticket has no customer — notification was not sent.';
          if (!this.notificationText.trim()) {
            this.notificationText = responseBody;
          }
          this.response.text = '';
        },
        error: () => {
          this.errorMessage = 'Failed to send response or customer notification.';
        },
      });
  }

  notifyCustomer(): void {
    if (!this.selectedTicketId) {
      this.errorMessage = 'Select a ticket.';
      return;
    }
    const ticket = this.tickets.find((t) => t._id === this.selectedTicketId);
    if (!ticket?.customerId) {
      this.errorMessage =
        'This ticket has no customer on file. Only customer-submitted tickets can receive stored notifications.';
      return;
    }
    const body =
      this.notificationText.trim() ||
      `Update on ticket "${ticket.title}": status is ${ticket.status}.`;
    this.errorMessage = '';
    this.ticketService
      .sendNotification({
        ticketId: ticket._id,
        customerId: ticket.customerId,
        message: body,
        subject: this.buildNotificationSubject(ticket),
        fromAgent: this.auth.getUser()?.username,
      })
      .subscribe({
        next: () => {
          this.statusMessage = 'Notification saved for the customer.';
          this.notificationText = '';
        },
        error: () => {
          this.errorMessage = 'Notification service request failed.';
        },
      });
  }

  private buildNotificationSubject(ticket: TicketItem): string {
    const title = (ticket.title || '').trim() || 'Untitled ticket';
    return `Message from support - ${title}`;
  }
}
