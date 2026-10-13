import { Injectable } from '@angular/core';
import { PokemonResume } from '../pokemon/pokemon.service';

/**
 * Équipe en cours de création, conservée pendant la navigation
 * (aller voir le détail d'un Pokémon puis revenir ne vide plus l'équipe).
 * Service singleton : l'état vit tant que l'application est ouverte.
 */
@Injectable({ providedIn: 'root' })
export class BrouillonEquipeService {
  equipe: (PokemonResume | null)[] = [null, null, null, null, null, null];
  nom = '';
  publique = false;
  source: any = { kind: 'generation', num: 1 };
  recherche = '';

  get estVide(): boolean {
    return this.equipe.every(m => m === null) && !this.nom;
  }

  vider(): void {
    this.equipe = [null, null, null, null, null, null];
    this.nom = '';
    this.publique = false;
    this.source = { kind: 'generation', num: 1 };
    this.recherche = '';
  }
}
