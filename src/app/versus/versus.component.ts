import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { API_URL } from '../api.config';

// Libellés français des types (les données restent en anglais, comme dans PokéAPI)
const TYPES_FR: Record<string, string> = {
  normal: 'Normal', fire: 'Feu', water: 'Eau', electric: 'Électrik', grass: 'Plante',
  ice: 'Glace', fighting: 'Combat', poison: 'Poison', ground: 'Sol', flying: 'Vol',
  psychic: 'Psy', bug: 'Insecte', rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon',
  dark: 'Ténèbres', steel: 'Acier', fairy: 'Fée',
};

@Component({
  selector: 'app-versus',
  standalone: false,
  templateUrl: './versus.component.html',
  styleUrl: './versus.component.css'
})
export class VersusComponent {
  mesEquipes: any[] = [];
  adversaires: any[] = [];   // mes équipes + équipes publiques des autres dresseurs
  idA = '';
  idB = '';
  resultat: any = null;
  chargement = false;
  erreur = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    forkJoin({
      miennes: this.http.get<any[]>(`${API_URL}/teams`),
      publiques: this.http.get<any[]>(`${API_URL}/teams/public`),
    }).subscribe(({ miennes, publiques }) => {
      this.mesEquipes = miennes;
      const mesIds = new Set(miennes.map(t => t.idTeam));
      const autres = publiques
        .filter(t => !mesIds.has(t.idTeam))
        .map(t => ({ ...t, label: `${t.nom} (publique)` }));
      this.adversaires = [...miennes.map(t => ({ ...t, label: t.nom })), ...autres];

      // Arrivée depuis le bouton « Combattre » d'une carte d'équipe
      this.idA = this.route.snapshot.queryParamMap.get('a') || miennes[0]?.idTeam || '';
      this.idB = this.adversaires.find(t => t.idTeam !== this.idA)?.idTeam || '';
    });
  }

  peutLancer(): boolean {
    return !!this.idA && !!this.idB && this.idA !== this.idB && !this.chargement;
  }

  lancer() {
    this.chargement = true;
    this.erreur = '';
    this.resultat = null;
    this.http.post<any>(`${API_URL}/teams/${this.idA}/versus/${this.idB}`, {}).subscribe({
      next: (r) => {
        this.resultat = r;
        this.chargement = false;
      },
      error: (err: HttpErrorResponse) => {
        this.erreur = err.error?.error || "L'affrontement n'a pas pu être calculé.";
        this.chargement = false;
      }
    });
  }

  // --- Aides d'affichage ---

  cote(c: 'A' | 'B') {
    return {
      equipe: this.resultat.teams[c],
      score: c === 'A' ? this.resultat.teamA : this.resultat.teamB,
      adverse: c === 'A' ? this.resultat.teams.B : this.resultat.teams.A,
      gagnant: this.resultat.winner === c,
    };
  }

  largeurScore(score: number): number {
    const max = Math.max(this.resultat.teamA.score, this.resultat.teamB.score);
    return max > 0 ? Math.round((score / max) * 100) : 0;
  }

  details(detail: Record<string, number>) {
    return Object.entries(detail).map(([type, valeur]) => ({ type, valeur }));
  }

  typeFr(type: string): string {
    return TYPES_FR[type] || type;
  }

  signe(n: number): string {
    return n > 0 ? `+${n}` : `${n}`;
  }
}
