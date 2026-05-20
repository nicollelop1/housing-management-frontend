import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyContracts } from './my-contracts';

describe('MyContracts', () => {
  let component: MyContracts;
  let fixture: ComponentFixture<MyContracts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyContracts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyContracts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
