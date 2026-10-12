import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeCreatComponent } from './equipe-creat.component';

describe('EquipeCreatComponent', () => {
  let component: EquipeCreatComponent;
  let fixture: ComponentFixture<EquipeCreatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EquipeCreatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipeCreatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
