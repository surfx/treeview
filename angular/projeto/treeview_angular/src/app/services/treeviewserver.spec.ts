import { TestBed } from '@angular/core/testing';

import { Treeviewserver } from './treeviewserver';

describe('Treeviewserver', () => {
  let service: Treeviewserver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Treeviewserver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
