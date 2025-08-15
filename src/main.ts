import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { AppShell } from './app/app-shell';

bootstrapApplication(AppShell, {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(),
    provideAnimations(),
    provideZonelessChangeDetection(),
  ],
}).catch((err) => console.error(err));
