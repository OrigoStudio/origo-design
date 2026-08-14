import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

export interface RenderPrimitiveOptions<T> {
  component: Type<T>;
  inputs?: Partial<T>;
}

export async function renderPrimitive<T>(
  options: RenderPrimitiveOptions<T>
): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [options.component],
  }).compileComponents();

  const fixture = TestBed.createComponent(options.component);

  if (options.inputs) {
    for (const [key, value] of Object.entries(options.inputs)) {
      fixture.componentRef.setInput(key, value);
    }
  }

  fixture.detectChanges();
  return fixture;
}
