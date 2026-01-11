import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTreeView } from './modal-tree-view';

describe('ModalTreeView', () => {
  let component: ModalTreeView;
  let fixture: ComponentFixture<ModalTreeView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTreeView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTreeView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
