import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';
import {
  CreateTicketPayload,
  TicketItem,
  TicketService,
} from '../services/ticket';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-customer-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['../shared/dashboard-shared.css', './customer-dashboard.component.css'],
})
export class CustomerDashboardComponent implements OnInit {
  private readonly cachePrefix = 'cst_customer_tickets_';
  tickets: TicketItem[] = [];
  loading = false;
  newTicket: CreateTicketPayload = {
    title: '',
    description: '',
    priority: 'medium',
  };
  creating = false;
  editingId: string | null = null;
  editDraft: CreateTicketPayload = {
    title: '',
    description: '',
    priority: 'medium',
  };
  saving = false;
  deletingId: string | null = null;
  statusMessage = '';
  errorMessage = '';

  constructor(
    private readonly ticketService: TicketService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.hydrateFromCache();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.ticketService
      .getTickets()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.tickets = Array.isArray(data) ? data : [];
          this.persistToCache();
          this.errorMessage = '';
        },
        error: (err: unknown) => {
          this.errorMessage = this.describeTicketError(
            err,
            'Unable to load your tickets.'
          );
        },
      });
  }

  createTicket(): void {
    if (this.creating) {
      return;
    }
    if (!this.newTicket.title.trim() || !this.newTicket.description.trim()) {
      this.errorMessage = 'Title and description are required.';
      return;
    }
    this.creating = true;
    this.ticketService
      .createTicket(this.newTicket)
      .pipe(
        // Never keep the button blocked due to follow-up requests.
        finalize(() => {
          this.creating = false;
        })
      )
      .subscribe({
        next: (created) => {
          // Immediate local update for fast UX.
          if (created && typeof created._id === 'string') {
            this.tickets = [created, ...this.tickets];
            this.persistToCache();
          }
          this.newTicket = { title: '', description: '', priority: 'medium' };
          this.statusMessage = 'Ticket created.';
          this.errorMessage = '';

          // Refresh in background as source of truth.
          this.load();
        },
        error: (err: unknown) => {
          this.errorMessage = this.describeTicketError(
            err,
            'Could not create ticket.'
          );
        },
      });
  }

  startEdit(ticket: TicketItem): void {
    this.editingId = ticket._id;
    this.editDraft = {
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority as CreateTicketPayload['priority'],
    };
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(): void {
    if (this.saving) {
      return;
    }
    if (!this.editingId) {
      return;
    }
    if (!this.editDraft.title.trim() || !this.editDraft.description.trim()) {
      this.errorMessage = 'Title and description are required.';
      return;
    }
    this.saving = true;
    this.ticketService
      .updateTicket(this.editingId, {
        title: this.editDraft.title.trim(),
        description: this.editDraft.description.trim(),
        priority: this.editDraft.priority,
      })
      .subscribe({
        next: (updated) => {
          this.tickets = this.tickets.map((t) => (t._id === updated._id ? updated : t));
          this.persistToCache();
          this.editingId = null;
          this.statusMessage = 'Ticket updated.';
          this.errorMessage = '';
          this.saving = false;
          this.load();
        },
        error: (err: unknown) => {
          this.saving = false;
          this.errorMessage = this.describeTicketError(
            err,
            'Update failed (you can only edit your own fields).'
          );
        },
      });
  }

  private describeTicketError(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'name' in err && err.name === 'TimeoutError') {
      return 'Request timed out. Please try once more.';
    }
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Cannot reach ticket service. Start it: cd backend\\ticket-service then npm start (port 5000).';
      }
      const body = err.error;
      if (body && typeof body === 'object' && 'error' in body) {
        const msg = (body as { error: unknown }).error;
        if (typeof msg === 'string') {
          return msg;
        }
      }
      if (err.status === 401) {
        return 'Missing user context. Log out and log in again.';
      }
      if (err.status === 403) {
        return 'Not allowed to change this ticket.';
      }
      return `${fallback} (HTTP ${err.status})`;
    }
    return fallback;
  }

  private cacheKey(): string | null {
    const userId = this.authService.getUser()?.id;
    if (!userId) {
      return null;
    }
    return `${this.cachePrefix}${userId}`;
  }

  private hydrateFromCache(): void {
    const key = this.cacheKey();
    if (!key) {
      return;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.tickets = parsed as TicketItem[];
      }
    } catch {
      localStorage.removeItem(key);
    }
  }

  private persistToCache(): void {
    const key = this.cacheKey();
    if (!key) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(this.tickets));
  }

  deleteTicket(id: string): void {
    if (this.deletingId) {
      return;
    }
    this.deletingId = id;
    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        this.tickets = this.tickets.filter((t) => t._id !== id);
        this.persistToCache();
        this.statusMessage = 'Ticket deleted.';
        this.errorMessage = '';
        this.deletingId = null;
      },
      error: (err: unknown) => {
        this.deletingId = null;
        this.errorMessage = this.describeTicketError(err, 'Delete failed.');
      },
    });
  }
}
