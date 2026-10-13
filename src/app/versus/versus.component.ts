import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { API_URL } from '../api.config';
import { typeFr } from '../commun/pokemon-types';
import { NomPokemonPipe } from '../commun/nom-pokemon.pipe';

type Phase = 'repos' | 'intro' | 'envoi' | 'stats' | 'attaques' | 'bonus' | 'ko' | 'fin';
type Cote = 'A' | 'B';

interface Attaque {
  de: Cote;         // équipe qui attaque
  type: string;     // type de l'attaque
  valeur: number;   // résistances - faiblesses du défenseur pour ce type
}

const SPRITE_DOS = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/';

@Component({
  selector: 'app-versus',
  standalone: false,
  templateUrl: './versus.component.html',
  styleUrl: './versus.component.css'
})
export class VersusComponent implements OnDestroy {
  // Sélection des équipes
  mesEquipes: any[] = [];
  adversaires: any[] = [];   // mes équipes + équipes publiques des autres dresseurs
  idA = '';
  idB = '';
  resultat: any = null;
  chargement = false;
  erreur = '';

  // Mise en scène
  phase: Phase = 'repos';
  dialogue = '';
  attaque: Attaque | null = null;
  numeroAttaque = 0;          // change à chaque attaque pour relancer l'animation CSS
  impact: Cote | null = null; // côté qui encaisse
  bouclier: Cote | null = null;
  score = { A: 0, B: 0 };     // compteurs affichés dans les encadrés
  pv = { A: 100, B: 100 };    // barres de PV en %
  envoyes = 0;                // nombre de Pokémon déjà sortis de leur Poké Ball
  confettis: { x: number; delai: number; couleur: string; taille: number }[] = [];

  private run = 0;            // identifiant de la séquence en cours (annule l'ancienne)
  private readonly noms = new NomPokemonPipe();
  readonly mouvementReduit = typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  ngOnDestroy() {
    this.run++; // stoppe une animation en cours si on quitte la page
  }

  peutLancer(): boolean {
    return !!this.idA && !!this.idB && this.idA !== this.idB && !this.chargement && !this.enCours;
  }

  get enCours(): boolean {
    return this.phase !== 'repos' && this.phase !== 'fin';
  }

  lancer() {
    this.chargement = true;
    this.erreur = '';
    this.http.post<any>(`${API_URL}/teams/${this.idA}/versus/${this.idB}`, {}).subscribe({
      next: (r) => {
        this.resultat = r;
        this.chargement = false;
        this.mouvementReduit ? this.passer() : this.jouer();
      },
      error: (err: HttpErrorResponse) => {
        this.erreur = err.error?.error || "L'affrontement n'a pas pu être calculé.";
        this.chargement = false;
      }
    });
  }

  // --- La séquence de combat ---------------------------------------------------
  // Chaque étape attend un délai ; si l'utilisateur passe ou relance,
  // `run` change et l'ancienne séquence s'arrête d'elle-même.

  async jouer() {
    const id = ++this.run;
    const r = this.resultat;
    const A = r.teams.A, B = r.teams.B;
    const attente = (ms: number) => new Promise<boolean>(ok => setTimeout(() => ok(id === this.run), ms));

    this.reinitialiser();

    // 1. Écran d'intro « VS »
    this.phase = 'intro';
    if (!await attente(1700)) return;

    // 2. Les Pokémon sortent de leurs Poké Balls
    this.phase = 'envoi';
    this.ecrire(`${A.nom} et ${B.nom} envoient leurs Pokémon !`);
    const total = Math.max(A.members.length, B.members.length);
    for (let i = 1; i <= total; i++) {
      this.envoyes = i;
      if (!await attente(260)) return;
    }
    if (!await attente(700)) return;

    // 3. Puissance brute : total des stats
    this.phase = 'stats';
    this.ecrire(`Puissance brute : ${r.teamA.statTotal} contre ${r.teamB.statTotal} !`);
    this.compter('A', 0, r.teamA.statTotal, 1100, id);
    this.compter('B', 0, r.teamB.statTotal, 1100, id);
    if (!await attente(1700)) return;

    // 4. Échanges d'attaques par type
    this.phase = 'attaques';
    for (const att of this.attaques()) {
      const attaquant = att.de === 'A' ? A.nom : B.nom;
      const defenseur: Cote = att.de === 'A' ? 'B' : 'A';
      this.attaque = att;
      this.numeroAttaque++;
      this.impact = null;
      this.bouclier = null;
      this.ecrire(`${attaquant} attaque en ${typeFr(att.type)}…`);
      if (!await attente(650)) return;

      if (att.valeur < 0) {
        this.impact = defenseur;
        this.ecrire(`C'est super efficace ! (${att.valeur})`);
      } else if (att.valeur > 0) {
        this.bouclier = defenseur;
        this.ecrire(`Ce n'est pas très efficace… (+${att.valeur})`);
      } else {
        this.ecrire(`L'attaque porte normalement.`);
      }
      if (!await attente(850)) return;
    }
    this.attaque = null;
    this.impact = null;
    this.bouclier = null;

    // 5. Bonus d'avantage de type : les scores se transforment
    this.phase = 'bonus';
    const fav: Cote = r.teamA.typeAdvantage >= r.teamB.typeAdvantage ? 'A' : 'B';
    const favori = fav === 'A' ? r.teamA : r.teamB;
    this.ecrire(favori.typeAdvantage > 0
      ? `Avantage de type pour ${favori.name} : ×${favori.multiplier} !`
      : `Aucun avantage de type : la puissance brute décide !`);
    this.compter('A', r.teamA.statTotal, r.teamA.score, 1300, id);
    this.compter('B', r.teamB.statTotal, r.teamB.score, 1300, id);
    const max = Math.max(r.teamA.score, r.teamB.score) || 1;
    this.pv = { A: Math.round(r.teamA.score / max * 100), B: Math.round(r.teamB.score / max * 100) };
    if (!await attente(1900)) return;

    // 6. K.O. et victoire
    this.terminer();
  }

  /** Va directement au résultat (bouton « Passer » ou mouvement réduit). */
  passer() {
    this.run++;
    this.reinitialiser();
    const r = this.resultat;
    this.envoyes = 6;
    this.score = { A: r.teamA.score, B: r.teamB.score };
    const max = Math.max(r.teamA.score, r.teamB.score) || 1;
    this.pv = { A: Math.round(r.teamA.score / max * 100), B: Math.round(r.teamB.score / max * 100) };
    this.terminer();
  }

  private terminer() {
    const r = this.resultat;
    this.phase = 'ko';
    if (r.winner === 'draw') {
      this.ecrire(`Égalité parfaite ! Les deux équipes restent debout.`);
    } else {
      const gagnant = r.winner === 'A' ? r.teams.A : r.teams.B;
      const perdant = r.winner === 'A' ? r.teams.B : r.teams.A;
      this.ecrire(`${perdant.nom} est K.O. ! ${gagnant.nom} remporte le combat !`);
      this.lancerConfettis(gagnant);
    }
    const id = this.run;
    setTimeout(() => { if (id === this.run) this.phase = 'fin'; }, this.mouvementReduit ? 0 : 2200);
  }

  private reinitialiser() {
    this.attaque = null;
    this.impact = null;
    this.bouclier = null;
    this.score = { A: 0, B: 0 };
    this.pv = { A: 100, B: 100 };
    this.envoyes = 0;
    this.confettis = [];
    this.dialogue = '';
  }

  /** Attaques à jouer : on alterne A puis B, 6 au maximum pour garder du rythme. */
  private attaques(): Attaque[] {
    const r = this.resultat;
    // teamB.defensiveDetail = effet des types de A sur B, et inversement
    const deA = Object.entries(r.teamB.defensiveDetail).map(([type, v]) => ({ de: 'A' as Cote, type, valeur: v as number }));
    const deB = Object.entries(r.teamA.defensiveDetail).map(([type, v]) => ({ de: 'B' as Cote, type, valeur: v as number }));
    const liste: Attaque[] = [];
    for (let i = 0; i < Math.max(deA.length, deB.length); i++) {
      if (deA[i]) liste.push(deA[i]);
      if (deB[i]) liste.push(deB[i]);
    }
    return liste.slice(0, 6);
  }

  /** Effet machine à écrire dans la boîte de dialogue. */
  private ecrire(texte: string) {
    const id = this.run;
    this.dialogue = '';
    let i = 0;
    const tick = () => {
      if (id !== this.run || i > texte.length) return;
      this.dialogue = texte.slice(0, i++);
      setTimeout(tick, 18);
    };
    tick();
  }

  /** Fait défiler un compteur de score. */
  private compter(cote: Cote, de: number, a: number, duree: number, id: number) {
    const debut = performance.now();
    const pas = (t: number) => {
      if (id !== this.run) return;
      const p = Math.min(1, (t - debut) / duree);
      this.score[cote] = Math.round(de + (a - de) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }

  private lancerConfettis(gagnant: any) {
    const couleurs = ['#ffd700', '#0d6efd', '#dc3545', '#198754', '#f107a3', '#ffffff'];
    this.confettis = Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      delai: Math.random() * 0.8,
      couleur: couleurs[Math.floor(Math.random() * couleurs.length)],
      taille: 6 + Math.random() * 8,
    }));
  }

  // --- Aides d'affichage ---------------------------------------------------------

  estGagnant(c: Cote): boolean {
    return (this.phase === 'ko' || this.phase === 'fin') && this.resultat?.winner === c;
  }

  estPerdant(c: Cote): boolean {
    return (this.phase === 'ko' || this.phase === 'fin')
      && this.resultat?.winner !== 'draw' && this.resultat?.winner !== c;
  }

  couleurPv(pv: number): string {
    return pv > 50 ? 'pv-vert' : pv > 20 ? 'pv-orange' : 'pv-rouge';
  }

  spriteDos(p: any): string {
    return `${SPRITE_DOS}${p.pokemonId}.png`;
  }

  /** Si le sprite de dos n'existe pas, on retombe sur le sprite de face. */
  secours(event: Event, p: any) {
    const img = event.target as HTMLImageElement;
    if (img.src !== p.sprite) img.src = p.sprite;
  }

  nom(p: any): string {
    return this.noms.transform(p.name);
  }

  cote(c: Cote) {
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

  typeFr = typeFr;

  signe(n: number): string {
    return n > 0 ? `+${n}` : `${n}`;
  }
}
