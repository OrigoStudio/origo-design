import { TestBed } from '@angular/core/testing';
import { PreviewService } from './preview.service';

describe('PreviewService', () => {
  let service: PreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreviewService],
    });
    service = TestBed.inject(PreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have empty initial compilation errors', () => {
    expect(service.compilationErrorsSignal()).toEqual([]);
  });

  it('should have null initial compiled AST', () => {
    expect(service.compiledAstSignal()).toBeNull();
  });
});
