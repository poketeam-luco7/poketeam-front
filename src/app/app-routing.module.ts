import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { EquipesListeComponent } from './equipes-liste/equipes-liste.component';
import { EquipeCreatComponent } from './equipe-creat/equipe-creat.component';
import { PokemonDetailComponent } from './pokemon-detail/pokemon-detail.component';
import { ProfilComponent } from './profil/profil.component';

const routes: Routes = [
  {path:'',redirectTo:'accueil',pathMatch:'full'},
  {path:'accueil',component: AccueilComponent},
  {path:'liste-equipes',component: EquipesListeComponent},
  {path:'equipe-creation', component: EquipeCreatComponent},
  {path: 'pokemon/:id', component: PokemonDetailComponent},
  {path:'profil', component : ProfilComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
