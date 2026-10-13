import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';

@Component({
  selector: 'app-equipes-liste',
  standalone: false,
  templateUrl: './equipes-liste.component.html',
  styleUrl: './equipes-liste.component.css'
})
export class EquipesListeComponent {
  teams: any[] = [];
  chargement = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Le token est ajouté automatiquement par l'AuthInterceptor
    this.http.get<any[]>(`${API_URL}/teams`).subscribe({
      next: (response) => {
        this.teams = response;
        this.chargement = false;
      },
      error: () => (this.chargement = false)
    });
  }

  // Appelé par la team-card une fois la suppression confirmée par le serveur
  onTeamDeleted(idTeam: string) {
    this.teams = this.teams.filter(t => t.idTeam !== idTeam);
  }
}
