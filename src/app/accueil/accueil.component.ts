import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { API_URL } from '../api.config';

@Component({
  selector: 'app-accueil',
  standalone: false,
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {
  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  

  selectedProfilePic: string = '/img/pokeball.png'; 
  selectPic(pic: string) {
    this.selectedProfilePic = pic; // Met à jour l'affichage
    this.registerData.photoProfil = pic; // Met à jour les données à envoyer
    this.closeModal();
  }

  availablePics: string[] = [
    '/img/pokeball.png',
    '/img/superball.png',
    '/img/hyperball.png',
    '/img/masterball.png',
  ];

  registerData = {
    mail: '',
    nom: '',
    prenom: '',
    mdp: '',
    photoProfil: this.selectedProfilePic, // <-- Stocke ici l'image par défaut
  };

  constructor(private http: HttpClient) {}

  message = '';
  erreur = '';

  register() {
    this.message = '';
    this.erreur = '';
    this.http.post(`${API_URL}/users`, this.registerData).subscribe({
      next: () => {
        this.message = 'Compte créé ! Tu peux maintenant te connecter.';
      },
      error: (err: HttpErrorResponse) => {
        this.erreur = err.status === 409
          ? 'Cette adresse mail est déjà utilisée.'
          : 'Vérifie les champs : adresse mail valide et mot de passe de 6 caractères minimum.';
      }
    });
  }
}
