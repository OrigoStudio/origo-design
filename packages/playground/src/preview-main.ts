import { bootstrapApplication } from '@angular/platform-browser';
import { PreviewRootComponent } from './preview/preview-root.component';

bootstrapApplication(PreviewRootComponent, {
  providers: [],
}).catch(err => console.error(err));
