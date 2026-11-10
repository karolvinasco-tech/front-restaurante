import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComidasComponent } from './comidas.component';

describe('Comidas', () => {
  let component: ComidasComponent;
  let fixture: ComponentFixture<ComidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComidasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComidasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
