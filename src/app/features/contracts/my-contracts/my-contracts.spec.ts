import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyContractsComponent } from './my-contracts';

describe('MyContracts', () => {
  let component: MyContractsComponent;
  let fixture: ComponentFixture<MyContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyContractsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyContractsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
