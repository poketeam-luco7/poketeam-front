import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccueilComponent } from './accueil/accueil.component';
import { EquipesListeComponent } from './equipes-liste/equipes-liste.component';
import { TeamCardComponent } from './commun/team-card/team-card.component';
import { HttpClientModule } from '@angular/common/http';
import { EquipeCreatComponent } from './equipe-creat/equipe-creat.component';
import { PokemonDetailComponent } from './pokemon-detail/pokemon-detail.component';
import { ProfilComponent } from './profil/profil.component';

@NgModule({
  declarations: [
    AppComponent,
    AccueilComponent,
    EquipesListeComponent,
    TeamCardComponent,
    EquipeCreatComponent,
    PokemonDetailComponent,
    ProfilComponent,

    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
