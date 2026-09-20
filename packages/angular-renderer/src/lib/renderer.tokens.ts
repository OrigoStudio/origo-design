import { InjectionToken, Type } from '@angular/core';

import { ButtonComponent } from '../components/primitives/button/button.component';
import { TextInputComponent } from '../components/primitives/text-input/text-input.component';
import { VBoxComponent } from '../components/primitives/vbox/vbox.component';
// Batch 1 primitives moved to primitives.provider.ts

export const RENDERER_REGISTRY = new InjectionToken<Map<string, Type<unknown>>>(
  'RENDERER_REGISTRY',
  {
    providedIn: 'root',
    factory: () => {
      const map = new Map<string, Type<unknown>>();
      map.set('Button', ButtonComponent);
      map.set('button', ButtonComponent);
      map.set('TextInput', TextInputComponent);
      map.set('textInput', TextInputComponent);
      map.set('VBox', VBoxComponent);
      map.set('vbox', VBoxComponent);
      return map;
    },
  }
);
