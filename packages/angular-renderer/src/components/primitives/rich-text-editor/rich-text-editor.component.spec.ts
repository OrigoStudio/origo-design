import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RichTextEditorComponent } from './rich-text-editor.component';
import { ComponentRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('RichTextEditorComponent', () => {
  let component: RichTextEditorComponent;
  let fixture: ComponentFixture<RichTextEditorComponent>;
  let componentRef: ComponentRef<RichTextEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextEditorComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(RichTextEditorComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('contract', { id: '1', type: 'RichTextEditor', props: {} });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should implement ControlValueAccessor', () => {
    componentRef.setInput('contract', { id: '1', type: 'RichTextEditor', props: {} });
    fixture.detectChanges();
    expect(component.writeValue).toBeDefined();
    expect(component.registerOnChange).toBeDefined();
    expect(component.registerOnTouched).toBeDefined();
    expect(component.setDisabledState).toBeDefined();
  });

  it('should expose vc ViewContainerRef for ContainerComponent', () => {
    componentRef.setInput('contract', { id: '1', type: 'RichTextEditor', props: {} });
    fixture.detectChanges();
    expect(component.vc()).toBeDefined();
  });

  it('should not infinite loop on writeValue', () => {
    componentRef.setInput('contract', { id: '1', type: 'RichTextEditor', props: {} });
    fixture.detectChanges();

    // writing value updates the signal
    component.writeValue('<p>Hello</p>');
    expect(component.value()).toBe('<p>Hello</p>');

    // verify it doesn't trigger a recursive change because isUpdating is tracked
    const inputEvent = new Event('input');
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const contentElement = root.querySelector('.origo-rich-text-editor__content') as HTMLElement;

    contentElement.innerHTML = '<b>Hello</b>';
    contentElement.dispatchEvent(inputEvent);

    expect(component.value()).toBe('<b>Hello</b>');
  });
});
