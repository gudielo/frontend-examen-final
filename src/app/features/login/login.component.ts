import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>Iniciar Sesion</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input formControlName="username" placeholder="ctezop" />

        <label>Contraseña</label>
        <input type="password" formControlName="password" placeholder="123456a" />

        <button type="submit" [disabled]="form.invalid || loading">Ingresar</button>
      </form>

<!--      <p class="hint">Ejemplo JSON enviado:</p>-->
<!--      <pre ngNonBindable>&#123;-->
<!--  "Username": "oaranam3",-->
<!--  "Password": "123456a"-->
<!--&#125;</pre>-->

      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .container{max-width:420px;margin:40px auto;padding:24px;border:1px solid #ddd;border-radius:8px}
    form{display:flex;flex-direction:column;gap:12px}
    input{padding:8px 10px;border:1px solid #ccc;border-radius:6px}
    button{padding:10px;border-radius:6px;border:none;background:#1976d2;color:#fff;cursor:pointer}
    .error{color:#b00020;margin-top:10px}
    pre{background:#f5f5f5;padding:10px;border-radius:6px}
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.error = null;
    this.loading = true;
    const { username, password } = this.form.getRawValue();
    this.auth.login(username!, password!).subscribe({
      next: (token) => {
        this.loading = false;
        if (token) {
          this.router.navigateByUrl('/mensajes');
        } else {
          this.error = 'Autenticación fallida: token vacío.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Error al autenticar. Verifique sus credenciales.';
      }
    });
  }
}
