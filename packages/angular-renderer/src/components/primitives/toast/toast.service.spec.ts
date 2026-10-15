import { TestBed } from '@angular/core/testing';
import { OrigoToastService } from './toast.service';

describe('OrigoToastService', () => {
  let service: OrigoToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrigoToastService],
    });
    service = TestBed.inject(OrigoToastService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created and have empty initial messages', () => {
    expect(service).toBeTruthy();
    expect(service.messages()).toEqual([]);
  });

  it('should add message with show() and assign auto-generated id', () => {
    service.show({
      severity: 'info',
      summary: 'Test Summary',
      detail: 'Test Detail',
    });

    const msgs = service.messages();
    expect(msgs.length).toBe(1);
    expect(msgs[0].id).toBeTruthy();
    expect(msgs[0].summary).toBe('Test Summary');
    expect(msgs[0].detail).toBe('Test Detail');
  });

  it('should provide severity helper methods (info, success, warn, error)', () => {
    service.info('Info sum', 'Info det', 3000);
    service.success('Success sum', 'Success det', 4000);
    service.warn('Warn sum', 'Warn det', 5000);
    service.error('Error sum', 'Error det', 6000);

    const msgs = service.messages();
    expect(msgs.length).toBe(4);
    expect(msgs[0].severity).toBe('info');
    expect(msgs[1].severity).toBe('success');
    expect(msgs[2].severity).toBe('warn');
    expect(msgs[3].severity).toBe('error');
  });

  it('should suppress duplicate messages when preventDuplicates is true', () => {
    service.show({ severity: 'info', summary: 'Duplicate', detail: 'Msg' }, true);
    service.show({ severity: 'info', summary: 'Duplicate', detail: 'Msg' }, true);

    expect(service.messages().length).toBe(1);

    // Different severity is not a duplicate
    service.show({ severity: 'warn', summary: 'Duplicate', detail: 'Msg' }, true);
    expect(service.messages().length).toBe(2);
  });

  it('should remove specific message by id', () => {
    service.show({ id: 'msg-1', summary: 'One' });
    service.show({ id: 'msg-2', summary: 'Two' });

    expect(service.messages().length).toBe(2);

    service.remove('msg-1');
    const remaining = service.messages();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('msg-2');
  });

  it('should clear messages by group or all', () => {
    service.show({ id: 'm1', summary: 'G1', group: 'groupA' });
    service.show({ id: 'm2', summary: 'G2', group: 'groupB' });
    service.show({ id: 'm3', summary: 'G3', group: 'groupA' });

    expect(service.messages().length).toBe(3);

    service.clear('groupA');
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].id).toBe('m2');

    service.clear();
    expect(service.messages().length).toBe(0);
  });
});
