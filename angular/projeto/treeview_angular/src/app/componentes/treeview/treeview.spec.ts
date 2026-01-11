import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Treeview } from './treeview';

describe('Treeview', () => {
  let component: Treeview;
  let fixture: ComponentFixture<Treeview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Treeview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Treeview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
