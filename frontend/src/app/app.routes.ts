import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { agentGuard, customerGuard } from './guards/role.guards';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { RoleRedirectComponent } from './routing/role-redirect.component';
import { AgentDashboardComponent } from './agent/agent-dashboard.component';
import { AgentTicketsComponent } from './agent/agent-tickets.component';
import { AgentResponseComponent } from './agent/agent-response.component';
import { CustomerDashboardComponent } from './customer/customer-dashboard.component';
import { CustomerNotificationsComponent } from './customer/customer-notifications.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', component: RoleRedirectComponent },
      {
        path: 'agent/dashboard',
        component: AgentDashboardComponent,
        canActivate: [agentGuard],
        data: { title: 'Dashboard' },
      },
      {
        path: 'agent/tickets',
        component: AgentTicketsComponent,
        canActivate: [agentGuard],
        data: { title: 'Tickets' },
      },
      {
        path: 'agent/response',
        component: AgentResponseComponent,
        canActivate: [agentGuard],
        data: { title: 'Response & notifications' },
      },
      {
        path: 'customer/dashboard',
        component: CustomerDashboardComponent,
        canActivate: [customerGuard],
        data: { title: 'Dashboard' },
      },
      {
        path: 'customer/notifications',
        component: CustomerNotificationsComponent,
        canActivate: [customerGuard],
        data: { title: 'Notifications' },
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
