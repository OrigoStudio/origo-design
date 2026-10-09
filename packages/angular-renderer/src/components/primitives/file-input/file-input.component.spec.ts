import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileInputComponent } from './file-input.component';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideHttpClient } from '@angular/common/http';

describe('FileInputComponent', () => {
  let component: FileInputComponent;
  let fixture: ComponentFixture<FileInputComponent>;
  let componentRef: ComponentRef<FileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileInputComponent],
      providers: [
        WebExperienceAdapterService,
        provideZonelessChangeDetection(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileInputComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('contract', { id: '1', type: 'FileInput', props: {} });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should implement ControlValueAccessor', () => {
    componentRef.setInput('contract', { id: '1', type: 'FileInput', props: {} });
    fixture.detectChanges();
    expect(component.writeValue).toBeDefined();
    expect(component.registerOnChange).toBeDefined();
    expect(component.registerOnTouched).toBeDefined();
    expect(component.setDisabledState).toBeDefined();
  });

  it('should render an input type file', () => {
    componentRef.setInput('contract', { id: '1', type: 'FileInput', props: {} });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const inputElement = root.querySelector('input[type="file"]') as HTMLInputElement;
    expect(inputElement).toBeTruthy();
  });

  it('should expose vc ViewContainerRef for ContainerComponent', () => {
    componentRef.setInput('contract', { id: '1', type: 'FileInput', props: {} });
    fixture.detectChanges();
    expect(component.vc()).toBeDefined();
  });

  it('should emit fileSelect event when a file is selected', () => {
    componentRef.setInput('contract', { id: '1', type: 'FileInput', props: {} });
    fixture.detectChanges();
    jest.spyOn(component.fileSelect, 'emit');
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const inputElement = root.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([''], 'test.txt', { type: 'text/plain' });

    // Mock the files property
    Object.defineProperty(inputElement, 'files', {
      value: [file],
    });
    inputElement.dispatchEvent(new Event('change'));

    expect(component.fileSelect.emit).toHaveBeenCalledWith([file]);
  });
});
