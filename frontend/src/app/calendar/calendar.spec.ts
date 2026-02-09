import { ComponentFixture, TestBed } from '@angular/core/testing';

import { calendar } from './calendar';

describe('calendar', () => {
  let component: calendar;
  let fixture: ComponentFixture<calendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [calendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(calendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
