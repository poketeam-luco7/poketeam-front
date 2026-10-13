import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../api.config';

@Component({
  selector: 'app-team-card',
  standalone: false,
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.css']
})
export class TeamCardComponent {
  @Input() team: any; // équipe renvoyée par le service Équipes (avec ses members)
  @Output() deleted = new EventEmitter<string>();

  constructor(private http: HttpClient) {}

  // Plus besoin de 6 appels HTTP par carte : les membres (nom, sprite, types)
  // sont déjà dans l'équipe grâce aux instantanés, et dans le bon ordre.

  supprimerTeam(id: string) {
    if (!confirm(`Supprimer l'équipe « ${this.team.nom} » ?`)) return;
    // Correctif : token envoyé (intercepteur) et mise à jour APRÈS la réponse du serveur
    this.http.delete(`${API_URL}/teams/${id}`).subscribe({
      next: () => this.deleted.emit(id),
      error: () => alert("La suppression a échoué.")
    });
  }
}
