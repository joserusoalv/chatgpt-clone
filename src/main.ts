import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppShell } from './app/app-shell';
import { APP_ROUTES } from './app.routes';

bootstrapApplication(AppShell, {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(),
    provideAnimations(),
    // provideExperimentalZonelessChangeDetection(),
  ],
}).catch(err => console.error(err));
