import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of, debounceTime, switchMap, catchError } from 'rxjs';
import { API_URL } from '../api.config';
import { PokemonResume, PokemonService } from '../service/pokemon/pokemon.service';
import { TYPES, typeFr } from '../commun/pokemon-types';

type Source = { kind: 'generation'; num: number } | { kind: 'mega' } | { kind: 'forms' } | { kind: 'type'; type: string };

@Component({
  selector: 'app-equipe-creat',
  standalone: false,
  templateUrl: './equipe-creat.component.html',
  styleUrl: './equipe-creat.component.css'
})
export class EquipeCreatComponent {
  // Équipe en cours
  equipe: (PokemonResume | null)[] = [null, null, null, null, null, null];
  nomEquipe = '';
  estPublique = false;
  enregistrement = false;

  // Liste et filtres
  readonly generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  readonly types = TYPES;
  source: Source = { kind: 'generation', num: 1 };
  allPokemons: PokemonResume[] = [];
  pokemons: PokemonResume[] = [];
  searchText = '';
  chargement = false;

  // Analyse en direct (calculée par le Pokédex)
  analyse: any = null;
  private equipeModifiee = new Subject<void>();

  constructor(private pokemonService: PokemonService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.charger();
    // Une analyse par modification, en ignorant les réponses devenues obsolètes
    this.equipeModifiee.pipe(
      debounceTime(250),
      switchMap(() => {
        const ids = this.equipe.filter(m => m).map(m => m!.id);
        return ids.length
          ? this.http.post<any>(`${API_URL}/pokeapi/teams/analyze`, { pokemonIds: ids }).pipe(catchError(() => of(null)))
          : of(null);
      })
    ).subscribe(a => (this.analyse = a));
  }

  // --- Filtres ---
  // Les onglets Génération / Méga et le filtre de type sont indépendants :
  // choisir un type affiche ce type dans TOUTES les générations.

  choisirGeneration(num: number) {
    this.source = { kind: 'generation', num };
    this.charger();
  }

  choisirMegas() {
    this.source = { kind: 'mega' };
    this.charger();
  }

  choisirFormes() {
    this.source = { kind: 'forms' };
    this.charger();
  }

  choisirType(type: string | null) {
    this.source = type ? { kind: 'type', type } : { kind: 'generation', num: 1 };
    this.charger();
  }

  estGenerationActive(num: number) {
    return this.source.kind === 'generation' && this.source.num === num;
  }

  get typeActif(): string | null {
    return this.source.kind === 'type' ? this.source.type : null;
  }

  private charger() {
    const s = this.source;
    const requete: Observable<PokemonResume[]> =
      s.kind === 'generation' ? this.pokemonService.getGeneration(s.num)
      : s.kind === 'mega' ? this.pokemonService.getMegas()
      : s.kind === 'forms' ? this.pokemonService.getForms()
      : this.pokemonService.getByType(s.type);

    this.chargement = true;
    requete.subscribe({
      next: data => {
        this.allPokemons = data;
        this.chargement = false;
        this.filterPokemons();
      },
      error: () => (this.chargement = false),
    });
  }

  filterPokemons(): void {
    const search = this.searchText.toLowerCase().trim();
    this.pokemons = this.allPokemons.filter(p => p.name.toLowerCase().includes(search));
  }

  // --- Équipe ---

  /** Ce Pokémon précis est-il déjà dans l'équipe ? */
  dansEquipe(p: PokemonResume): boolean {
    return this.equipe.some(m => m?.id === p.id);
  }

  /** Une autre forme de la même espèce est dans l'équipe (ex. Dracaufeu / Méga-Dracaufeu X). */
  especeDejaPrise(p: PokemonResume): boolean {
    return !this.dansEquipe(p) && this.equipe.some(m => m?.baseSpecies === p.baseSpecies);
  }

  /** Clic sur « Ajouter » ou « Retirer » depuis la liste. */
  basculer(p: PokemonResume) {
    const index = this.equipe.findIndex(m => m?.id === p.id);
    index !== -1 ? this.retirerDeLEquipe(index) : this.addToTeam(p);
  }

  addToTeam(pokemon: PokemonResume) {
    // Mêmes règles que le service Équipes, vérifiées ici pour un retour immédiat
    if (this.dansEquipe(pokemon) || this.especeDejaPrise(pokemon)) {
      return; // Species Clause : un seul exemplaire de chaque espèce
    }
    if (pokemon.isMega && this.equipe.some(m => m?.isMega)) {
      alert('Une seule Méga-Évolution par équipe.');
      return;
    }
    const firstEmptyIndex = this.equipe.findIndex(member => member === null);
    if (firstEmptyIndex !== -1) {
      this.equipe[firstEmptyIndex] = pokemon;
      this.equipeModifiee.next();
    } else {
      alert('Équipe complète !');
    }
  }

  retirerDeLEquipe(index: number): void {
    this.equipe[index] = null;
    this.equipeModifiee.next();
  }

  newTeam(): void {
    if (!this.nomEquipe.trim()) {
      alert("Donne un nom à ton équipe.");
      return;
    }
    if (this.equipe.includes(null)) {
      alert('Votre équipe doit contenir 6 Pokémon.');
      return;
    }

    const data = {
      nom: this.nomEquipe.trim(),
      typePrincipal: this.typeActif || '',
      isPublic: this.estPublique,
      poke1: this.equipe[0]?.id,
      poke2: this.equipe[1]?.id,
      poke3: this.equipe[2]?.id,
      poke4: this.equipe[3]?.id,
      poke5: this.equipe[4]?.id,
      poke6: this.equipe[5]?.id,
    };

    this.enregistrement = true;
    this.http.post(`${API_URL}/teams`, data).subscribe({
      next: () => this.router.navigate(['/liste-equipes']),
      error: (err) => {
        this.enregistrement = false;
        alert(err.error?.error || "Erreur lors de l'enregistrement de l'équipe.");
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/liste-equipes']);
  }

  viewDetails(pokemon: PokemonResume): void {
    // Les formes par type (Arceus-Feu...) n'existent pas comme Pokémon dans PokéAPI : on montre l'espèce
    this.router.navigate(['/pokemon', typeof pokemon.id === 'string' ? pokemon.baseSpecies : pokemon.id]);
  }

  // --- Analyse ---

  get faiblesses() {
    return (this.analyse?.coverage || []).filter((c: any) => c.net < 0).sort((a: any, b: any) => a.net - b.net);
  }

  get pointsForts() {
    return (this.analyse?.coverage || []).filter((c: any) => c.net > 0).sort((a: any, b: any) => b.net - a.net);
  }

  classeCase(net: number): string {
    if (net <= -2) return 'case-danger';
    if (net < 0) return 'case-faible';
    if (net === 0) return 'case-neutre';
    return net >= 2 ? 'case-solide' : 'case-resiste';
  }

  // --- Affichage ---

  typeFr = typeFr;

  getTypeColor(type: string | null | undefined): string {
    return type ? `bg-${type}` : 'bg-secondary';
  }
}
