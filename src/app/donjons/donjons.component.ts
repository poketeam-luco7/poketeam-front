import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { API_URL } from '../api.config';
import { typeFr } from '../commun/pokemon-types';
import { NomPokemonPipe } from '../commun/nom-pokemon.pipe';
import { CombatCaptureService } from '../service/capture/combat-capture.service';

type Filtre = 'tous' | 'a-conquerir' | 'legendary' | 'mythical' | 'mega' | 'form';

/** Donjons : un par légendaire, fabuleux et Méga. On y entre avec une équipe enregistrée. */
@Component({
  selector: 'app-donjons',
  standalone: false,
  templateUrl: './donjons.component.html',
  styleUrl: './donjons.component.css'
})
export class DonjonsComponent {
  etat: any = null;              // GET /dungeons
  equipes: any[] = [];           // mes équipes (celles qui peuvent combattre)
  idEquipe = '';
  filtre: Filtre = 'a-conquerir';
  chargement = true;
  enCombat = false;
  erreur = '';
  annonces: string[] = [];

  readonly filtres: { id: Filtre; libelle: string }[] = [
    { id: 'a-conquerir', libelle: 'À conquérir' },
    { id: 'tous', libelle: 'Tous' },
    { id: 'legendary', libelle: 'Légendaires' },
    { id: 'mythical', libelle: 'Fabuleux' },
    { id: 'mega', libelle: 'Méga' },
    { id: 'form', libelle: 'Formes' },
  ];
  readonly libellesType: Record<string, string> = { legendary: 'Légendaire', mythical: 'Fabuleux', mega: 'Méga', form: 'Forme' };
  private readonly noms = new NomPokemonPipe();
  typeFr = typeFr;

  constructor(private http: HttpClient, private router: Router, private combat: CombatCaptureService) {}

  ngOnInit() {
    this.annonces = this.combat.annonces;
    this.combat.annonces = [];
    forkJoin({
      etat: this.http.get<any>(`${API_URL}/dungeons`),
      equipes: this.http.get<any[]>(`${API_URL}/teams`),
    }).subscribe({
      next: ({ etat, equipes }) => {
        this.etat = etat;
        this.equipes = equipes.filter(t => !t.locked?.length);
        // L'équipe la plus forte par défaut
        const forte = [...this.equipes].sort((a, b) => b.summary.statTotal - a.summary.statTotal)[0];
        this.idEquipe = forte?.idTeam || '';
        this.chargement = false;
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.error || 'Les donjons sont indisponibles pour le moment.';
      },
    });
  }

  get equipe(): any {
    return this.equipes.find(t => t.idTeam === this.idEquipe);
  }

  get puissance(): number {
    return this.equipe?.summary?.statTotal || 0;
  }

  get donjons(): any[] {
    const tous = this.etat?.dungeons || [];
    if (this.filtre === 'tous') return tous;
    if (this.filtre === 'a-conquerir') return tous.filter((d: any) => !d.conquered);
    return tous.filter((d: any) => d.kind === this.filtre);
  }

  get conquis(): number {
    return (this.etat?.dungeons || []).filter((d: any) => d.conquered).length;
  }

  /** Fusion : les partenaires à posséder en plus de l'espèce (Kyurem Noir : Zekrom). */
  partenaires(d: any): string[] {
    return (d.needsAll || []).slice(1).map((n: any) => this.noms.transform(n.name));
  }

  accessible(d: any): boolean {
    return !!this.equipe && this.puissance >= d.requirement && !this.enCombat;
  }

  entrer(d: any) {
    if (!this.accessible(d)) return;
    this.enCombat = true;
    this.erreur = '';
    this.http.post<any>(`${API_URL}/dungeons/${d.id}/fight`, { teamId: this.idEquipe }).subscribe({
      next: (r) => {
        const annonces: string[] = [];
        if (r.captured) annonces.push(`${this.noms.transform(r.captured.name)} rejoint ta collection !`);
        else if (r.won) annonces.push(`${this.noms.transform(d.name)} vaincu à nouveau : +1 victoire par membre.`);
        this.combat.dernier = r;
        this.combat.annonces = annonces;
        this.router.navigate(['/donjons/combat']);
      },
      error: (err) => {
        this.enCombat = false;
        this.erreur = err.error?.error || "Le combat n'a pas pu avoir lieu.";
      },
    });
  }
}
