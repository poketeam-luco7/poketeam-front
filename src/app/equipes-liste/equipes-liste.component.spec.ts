import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipesListeComponent } from './equipes-liste.component';

describe('EquipesListeComponent', () => {
  let component: EquipesListeComponent;
  let fixture: ComponentFixture<EquipesListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EquipesListeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipesListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
