import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // <-- Ajoute l'import HTTP

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

  register() {
    console.log('Données à envoyer :', this.registerData);

    this.http.post('http://localhost:3000/users', this.registerData).subscribe({
      next: (response) => {
        console.log('Inscription réussie', response);
      },
      error: (error) => {
        console.error('Erreur lors de l\'inscription', error);
      }
    });
  }
}
