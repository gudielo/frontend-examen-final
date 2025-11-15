import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { MensajesComponent } from './features/mensajes/mensajes.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'mensajes', component: MensajesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
