import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BebidasComponent } from './bebidas.component';

describe('BebidasComponent', () => {
  let component: BebidasComponent;
  let fixture: ComponentFixture<BebidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BebidasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BebidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});