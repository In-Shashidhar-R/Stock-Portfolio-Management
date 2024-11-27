import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockSaleDialogComponent } from './stock-sale-dialog.component';

describe('StockSaleDialogComponent', () => {
  let component: StockSaleDialogComponent;
  let fixture: ComponentFixture<StockSaleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockSaleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockSaleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
