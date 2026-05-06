import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TicketItem,
  TicketService,
} from '../services/ticket';

@Component({
  standalone: true,
  selector: 'app-agent-tickets',
  imports: [CommonModule],
  templateUrl: './agent-tickets.component.html',
  styleUrls: ['../shared/dashboard-shared.css', './agent-tickets.component.css'],
})
export class AgentTicketsComponent implements OnInit {
  tickets: TicketItem[] = [];
  statusMessage = '';
  errorMessage = '';

  constructor(private readonly ticketService: TicketService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: () => {
        this.errorMessage = 'Unable to load tickets.';
      },
    });
  }

  updateStatus(id: string, status: 'open' | 'in-progress' | 'resolved'): void {
    this.ticketService.updateTicket(id, { status }).subscribe({
      next: () => {
        this.statusMessage = `Ticket updated to ${status}.`;
        this.errorMessage = '';
        this.load();
      },
      error: () => {
        this.errorMessage = 'Failed to update ticket.';
      },
    });
  }

  deleteTicket(id: string): void {
    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        this.statusMessage = 'Ticket deleted.';
        this.errorMessage = '';
        this.load();
      },
      error: () => {
        this.errorMessage = 'Failed to delete ticket.';
      },
    });
  }

  customerLabel(ticket: TicketItem): string {
    if (ticket.customerId) {
      return ticket.customerId.slice(-6);
    }
    return '—';
  }
}
