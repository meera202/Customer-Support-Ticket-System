import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketItem, TicketService } from '../services/ticket';

@Component({
  standalone: true,
  selector: 'app-agent-dashboard',
  imports: [CommonModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['../shared/dashboard-shared.css', './agent-dashboard.component.css'],
})
export class AgentDashboardComponent implements OnInit {
  tickets: TicketItem[] = [];

  constructor(private readonly ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
    });
  }

  get totalTickets(): number {
    return this.tickets.length;
  }

  get resolvedTickets(): number {
    return this.tickets.filter((t) => t.status === 'resolved').length;
  }

  get openTickets(): number {
    return this.tickets.filter((t) => t.status !== 'resolved').length;
  }

  get resolutionRate(): string {
    if (!this.totalTickets) {
      return '0%';
    }
    return `${Math.round((this.resolvedTickets / this.totalTickets) * 100)}%`;
  }
}
