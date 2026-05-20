import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerRequests } from './owner-requests';

describe('OwnerRequests', () => {
  let component: OwnerRequests;
  let fixture: ComponentFixture<OwnerRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
