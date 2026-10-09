import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropzoneComponent } from './dropzone.component';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideHttpClient } from '@angular/common/http';

describe('DropzoneComponent', () => {
  let component: DropzoneComponent;
  let fixture: ComponentFixture<DropzoneComponent>;
  let componentRef: ComponentRef<DropzoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropzoneComponent],
      providers: [
        WebExperienceAdapterService,
        provideZonelessChangeDetection(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DropzoneComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('contract', { id: '1', type: 'Dropzone', props: {} });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should implement ControlValueAccessor', () => {
    componentRef.setInput('contract', { id: '1', type: 'Dropzone', props: {} });
    fixture.detectChanges();
    expect(component.writeValue).toBeDefined();
    expect(component.registerOnChange).toBeDefined();
    expect(component.registerOnTouched).toBeDefined();
    expect(component.setDisabledState).toBeDefined();
  });

  it('should expose vc ViewContainerRef for ContainerComponent', () => {
    componentRef.setInput('contract', { id: '1', type: 'Dropzone', props: {} });
    fixture.detectChanges();
    expect(component.vc()).toBeDefined();
  });

  it('should emit fileDrop event when a file is dropped', () => {
    componentRef.setInput('contract', { id: '1', type: 'Dropzone', props: {} });
    fixture.detectChanges();
    jest.spyOn(component.fileDrop, 'emit');

    const file = new File([''], 'test.txt', { type: 'text/plain' });

    const dropEvent = new Event('drop');
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file] },
    });
    component.onDrop(dropEvent as DragEvent);

    expect(component.fileDrop.emit).toHaveBeenCalledWith([file]);
  });
});
