import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStocksPageComponent } from './add-stocks-page.component';

describe('AddStocksPageComponent', () => {
  let component: AddStocksPageComponent;
  let fixture: ComponentFixture<AddStocksPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddStocksPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStocksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
