import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantRequests } from './tenant-requests';

describe('TenantRequests', () => {
  let component: TenantRequests;
  let fixture: ComponentFixture<TenantRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
