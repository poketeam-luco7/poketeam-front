import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_URL } from '../api.config';
import { typeFr } from '../commun/pokemon-types';
import { NomPokemonPipe } from '../commun/nom-pokemon.pipe';
import { CombatCaptureService } from '../service/capture/combat-capture.service';

@Component({
  selector: 'app-capture',
  standalone: false,
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.css'
})
export class CaptureComponent {
  etat: any = null;           // réponse de GET /capture
  chargement = true;
  erreur = '';
  annonces: string[] = [];

  // Édition de l'équipe
  edition = false;
  selection: (number | string)[] = [];

  private readonly noms = new NomPokemonPipe();
  typeFr = typeFr;

  constructor(private http: HttpClient, private router: Router, private combat: CombatCaptureService) {}

  ngOnInit() {
    this.annonces = this.combat.annonces;
    this.combat.annonces = [];
    this.recharger();
  }

  recharger() {
    this.http.get<any>(`${API_URL}/capture`).subscribe({
      next: (e) => { this.etat = e; this.chargement = false; },
      error: (err) => this.echec(err),
    });
  }

  private echec(err: HttpErrorResponse) {
    this.chargement = false;
    this.erreur = err.error?.error || 'Le mode Capture est indisponible pour le moment.';
  }

  private maj(e: any) {
    this.etat = { started: true, ...e };
    this.erreur = '';
  }

  // --- Départ -----------------------------------------------------------------------

  choisirStarter(id: number) {
    this.http.post<any>(`${API_URL}/capture/start`, { starter: id }).subscribe({
      next: (e) => this.maj(e),
      error: (err) => this.echec(err),
    });
  }

  // --- Équipe -------------------------------------------------------------------------

  get equipe(): any[] {
    if (!this.etat?.collection) return [];
    return this.etat.team.map((id: any) => this.etat.collection.find((c: any) => c.id === id)).filter((x: any) => x);
  }

  progression(p: any) {
    const nom = p.isMega ? null : p.name;
    return nom ? this.etat.progress[nom] : null;
  }

  pourcentage(prog: any): number {
    return Math.min(100, Math.round((prog.victories / prog.threshold) * 100));
  }

  prochain(prog: any): string {
    if (prog.next[0] === 'mega') return 'Méga-Évolution';
    return prog.next.length > 1 ? `${prog.next.length} évolutions possibles` : this.noms.transform(prog.next[0]);
  }

  ouvrirEdition() {
    this.selection = [...this.etat.team];
    this.edition = true;
  }

  basculer(id: number | string) {
    const i = this.selection.indexOf(id);
    if (i !== -1) this.selection.splice(i, 1);
    else if (this.selection.length < 6) this.selection.push(id);
  }

  enregistrerEquipe() {
    this.http.put<any>(`${API_URL}/capture/team`, { pokemonIds: this.selection }).subscribe({
      next: () => { this.edition = false; this.recharger(); },
      error: (err) => (this.erreur = err.error?.error || "L'équipe n'a pas pu être enregistrée."),
    });
  }

  // --- Runs ---------------------------------------------------------------------------

  lancerRun(tier: number) {
    this.http.post<any>(`${API_URL}/capture/run`, { tier }).subscribe({
      next: (run) => (this.etat.run = run),
      error: (err) => (this.erreur = err.error?.error || "La run n'a pas pu démarrer."),
    });
  }

  abandonner() {
    if (!confirm('Abandonner la run en cours ? Les victoires déjà obtenues restent acquises.')) return;
    this.http.delete(`${API_URL}/capture/run`).subscribe(() => this.recharger());
  }

  combattre(wildId: number) {
    this.http.post<any>(`${API_URL}/capture/run/fight`, { wildId }).subscribe({
      next: (r) => {
        this.combat.dernier = r;
        this.combat.annonces = (r.evolutions || []).map((id: any) => {
          const p = r.collection.find((c: any) => c.id === id);
          return `${p ? this.noms.transform(p.name) : 'Une évolution'} débloqué !`;
        });
        this.router.navigate(['/capture/combat']);
      },
      error: (err) => (this.erreur = err.error?.error || "Le combat n'a pas pu avoir lieu."),
    });
  }

  capturer(pokemonId: number) {
    this.http.post<any>(`${API_URL}/capture/run/reward`, { pokemonId }).subscribe({
      next: (r) => {
        this.annonces = [`${this.noms.transform(r.captured.name)} rejoint ta collection !`];
        this.maj(r);
      },
      error: (err) => (this.erreur = err.error?.error || 'La capture a échoué.'),
    });
  }

  choisirEvolution(to: number) {
    this.http.post<any>(`${API_URL}/capture/evolution`, { to }).subscribe({
      next: (r) => {
        const p = r.collection.find((c: any) => c.id === to);
        this.annonces = [`${this.noms.transform(p?.name)} débloqué !`];
        this.maj(r);
      },
      error: (err) => (this.erreur = err.error?.error || "L'évolution n'a pas pu être choisie."),
    });
  }

  libellePalier(t: any): string {
    return `${t.min} – ${t.max}`;
  }
}
