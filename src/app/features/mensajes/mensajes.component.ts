import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>Chat</h2>

      <div class="chat" [class.loading]="loadingMessages">
        <div class="loading-text" *ngIf="loadingMessages">Cargando mensajes...</div>
        <div class="error" *ngIf="errorMensajes">{{ errorMensajes }}</div>

        <ng-container *ngIf="!loadingMessages && !errorMensajes">
          <div class="message"
               *ngFor="let m of mensajes; trackBy: trackById">
            <div class="meta">
              <strong>{{ m.Login_Emisor || m.login || 'Usuario' }}</strong>
              <span>• {{ formateaFecha(m) }}</span>
            </div>
            <div class="content">{{ m.Contenido || m.contenido || m.mensaje }}</div>
          </div>
          <div *ngIf="mensajes.length === 0" class="empty">No hay mensajes.</div>
        </ng-container>
      </div>

      <form class="input-form" [formGroup]="form" (ngSubmit)="enviar()">
        <label class="sr-only">Mensaje</label>
        <textarea rows="3" formControlName="contenido" placeholder="Escribe tu mensaje..."></textarea>
        <button type="submit" [disabled]="form.invalid || loading">Enviar</button>
      </form>

      <div class="result" *ngIf="resultado">{{ resultado }}</div>
      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .container{max-width:700px;margin:40px auto;padding:24px;border:1px solid #ddd;border-radius:8px}
    .chat{border:1px solid #e0e0e0;border-radius:8px;max-height:420px;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
    .chat.loading{opacity:.7}
    .message{background:#f7f7f7;border:1px solid #eee;border-radius:10px;padding:10px}
    .message .meta{font-size:12px;color:#555;margin-bottom:6px;display:flex;gap:6px;align-items:center}
    .message .content{white-space:pre-wrap}
    .empty{color:#666;font-style:italic}
    .input-form{display:flex;flex-direction:column;gap:12px}
    textarea{padding:8px 10px;border:1px solid #ccc;border-radius:6px}
    button{padding:10px;border-radius:6px;border:none;background:#2e7d32;color:#fff;cursor:pointer}
    .error{color:#b00020;margin-top:10px}
    .result{color:#2e7d32;margin-top:10px}
    .sr-only{position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden}
  `]
})
export class MensajesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    contenido: ['', [Validators.required]]
  });

  loading = false;
  error: string | null = null;
  resultado: string | null = null;

  // listado de mensajes
  mensajes: any[] = [];
  loadingMessages = false;
  errorMensajes: string | null = null;

  // sala actual (se puede pasar por query param ?cod_sala=1). Default 1 para evitar 0 si no es válido.
  codSala: number = 1;

  // GET ahora se sirve desde nuestro servidor Node, que consulta SQL Server directamente.
  // En desarrollo (ng serve en :4200) apuntamos a http://localhost:8080 para evitar necesidad de proxy.
  private mensajesGetUrl = ((): string => {
    const isDev4200 = typeof window !== 'undefined' && window.location && window.location.port === '4200';
    const base = isDev4200 ? 'http://localhost:8080' : '';
    return `${base}/api/Mensajes`;
  })();
  // POST se mantiene contra el backend previo (si existe); si no, se puede implementar en server.js
  private mensajesPostUrl = 'https://backcvbgtmdesa.azurewebsites.net/api/Mensajes';

  ngOnInit(): void {
    // Leer cod_sala de query params si viene
    const qp = this.route.snapshot.queryParamMap;
    const salaParam = qp.get('cod_sala') ?? qp.get('sala') ?? qp.get('Cod_Sala');
    const parsed = salaParam ? parseInt(salaParam, 10) : NaN;
    if (!isNaN(parsed)) {
      this.codSala = parsed;
    }
    this.cargarMensajes();
  }

  cargarMensajes() {
    this.loadingMessages = true;
    this.errorMensajes = null;
    this.http.get<any[]>(this.mensajesGetUrl).subscribe({
      next: (lista) => {
        this.loadingMessages = false;
        const arr = Array.isArray(lista) ? lista : [];
        this.mensajes = this.ordenarDesc(arr);
      },
      error: (err) => {
        this.loadingMessages = false;
        const fallback = `No se pudieron cargar los mensajes. ${
          window.location.port === '4200'
            ? 'Asegúrese de ejecutar: npm run start (servidor en http://localhost:8080).'
            : 'Intente recargar la página o verifique el servidor.'
        }`;
        this.errorMensajes = err?.error?.message ?? fallback;
      }
    });
  }

  private ordenarDesc(arr: any[]): any[] {
    // intenta ordenar por fecha o id de forma descendente (más recientes arriba)
    const getDate = (m: any): number => {
      const fecha = m.Fecha ?? m.fecha ?? m.FechaEnvio ?? m.fechaEnvio ?? m.FechaCreacion ?? m.CreatedAt ?? m.createdAt;
      const n = fecha ? Date.parse(fecha) : NaN;
      return isNaN(n) ? 0 : n;
    };
    const getId = (m: any): number => {
      const id = m.Id_Mensaje ?? m.Cod_Mensaje ?? m.id ?? m.Id ?? m.ID;
      return typeof id === 'number' ? id : parseInt(id, 10) || 0;
    };

    const hasAnyDate = arr.some((m) => !!getDate(m));
    const sorted = [...arr].sort((a, b) => {
      if (hasAnyDate) return getDate(b) - getDate(a);
      return getId(b) - getId(a);
    });
    return sorted;
  }

  trackById = (_: number, m: any) => m.Id_Mensaje ?? m.Cod_Mensaje ?? m.id ?? m;

  formateaFecha(m: any): string {
    const raw = m.Fecha ?? m.fecha ?? m.FechaEnvio ?? m.fechaEnvio ?? m.FechaCreacion ?? m.CreatedAt ?? m.createdAt;
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(+d) ? d.toLocaleString() : '';
  }

  enviar() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = null;
    this.resultado = null;

    const login = this.auth.getUser();
    const contenido = (this.form.value.contenido || '').toString().trim();

    if (!login) {
      this.loading = false;
      this.error = 'No se reconoce el usuario (Login_Emisor). Inicie sesión nuevamente.';
      return;
    }

    if (!contenido) {
      this.loading = false;
      this.error = 'El contenido no puede estar vacío.';
      return;
    }

    const body = { Cod_Sala: this.codSala, Login_Emisor: login, Contenido: contenido };

    this.http.post(this.mensajesPostUrl, body).subscribe({
      next: (res) => {
        this.loading = false;
        this.resultado = 'Mensaje enviado correctamente.';
        this.form.reset();
        this.cargarMensajes();
      },
      error: (err) => {
        this.loading = false;
        const backendMsg = err?.error?.Message ?? err?.error?.message ?? err?.message;
        this.error = backendMsg || 'Error al enviar el mensaje (verifique el token).';
      }
    });
  }
}
