import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { PreviewRootComponent } from './preview/preview-root.component';

if (window.location.search.includes('preview=true')) {
  bootstrapApplication(PreviewRootComponent, appConfig).catch(err => console.error(err));
} else {
  bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
}
