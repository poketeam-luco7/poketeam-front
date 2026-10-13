import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccueilComponent } from './accueil/accueil.component';
import { EquipesListeComponent } from './equipes-liste/equipes-liste.component';
import { TeamCardComponent } from './commun/team-card/team-card.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { EquipeCreatComponent } from './equipe-creat/equipe-creat.component';
import { PokemonDetailComponent } from './pokemon-detail/pokemon-detail.component';
import { ProfilComponent } from './profil/profil.component';
import { AuthInterceptor } from './service/auth/auth.interceptor';
import { VersusComponent } from './versus/versus.component';
import { NomPokemonPipe } from './commun/nom-pokemon.pipe';
import { CaptureComponent } from './capture/capture.component';
import { PokedexComponent } from './pokedex/pokedex.component';

@NgModule({
  declarations: [
    AppComponent,
    AccueilComponent,
    EquipesListeComponent,
    TeamCardComponent,
    EquipeCreatComponent,
    PokemonDetailComponent,
    ProfilComponent,
    VersusComponent,
    NomPokemonPipe,
    CaptureComponent,
    PokedexComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
