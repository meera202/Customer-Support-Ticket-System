import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationRecord, TicketService } from '../services/ticket';

@Component({
  standalone: true,
  selector: 'app-customer-notifications',
  imports: [CommonModule],
  templateUrl: './customer-notifications.component.html',
  styleUrls: ['../shared/dashboard-shared.css', './customer-notifications.component.css'],
})
export class CustomerNotificationsComponent implements OnInit {
  items: NotificationRecord[] = [];
  errorMessage = '';

  constructor(private readonly ticketService: TicketService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.ticketService.getNotifications().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: () => {
        this.errorMessage = 'Unable to load notifications.';
      },
    });
  }
}
