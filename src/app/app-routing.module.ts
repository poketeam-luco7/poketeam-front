import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { EquipesListeComponent } from './equipes-liste/equipes-liste.component';
import { EquipeCreatComponent } from './equipe-creat/equipe-creat.component';
import { PokemonDetailComponent } from './pokemon-detail/pokemon-detail.component';
import { ProfilComponent } from './profil/profil.component';
import { authGuard } from './service/auth/auth.guard';

const routes: Routes = [
  {path:'',redirectTo:'accueil',pathMatch:'full'},
  {path:'accueil',component: AccueilComponent},
  {path:'liste-equipes',component: EquipesListeComponent, canActivate: [authGuard]},
  {path:'equipe-creation', component: EquipeCreatComponent, canActivate: [authGuard]},
  {path: 'pokemon/:id', component: PokemonDetailComponent},
  {path:'profil', component : ProfilComponent, canActivate: [authGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
