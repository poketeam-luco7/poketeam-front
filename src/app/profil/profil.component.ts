import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { API_URL } from '../api.config';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent {

  constructor(private http: HttpClient){}

  selectedProfilePic: string = '/img/pokeball.png';
  isModalOpen: boolean = false;
  message = '';
  erreur = '';

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
    mdp: ''
  };

  ngOnInit(){
    // Correctif : le formulaire est pré-rempli depuis le profil
    // (value="..." est ignoré quand on utilise [(ngModel)])
    this.http.get<any>(`${API_URL}/auth/profile`).subscribe({
      next: (profil) => {
        this.registerData.mail = profil.mail;
        this.registerData.nom = profil.nom;
        this.registerData.prenom = profil.prenom;
        this.selectedProfilePic = profil.photoprofil || this.selectedProfilePic;
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  selectPic(pic: string) {
    this.selectedProfilePic = pic;
    this.closeModal();
  }

  modifierProfil(){
    this.message = '';
    this.erreur = '';
    const body: any = {
      mail: this.registerData.mail,
      nom: this.registerData.nom,
      prenom: this.registerData.prenom,
      photoProfil: this.selectedProfilePic,
    };
    // Correctif : `if (mdp = '')` était une affectation qui vidait le mot de passe
    if (this.registerData.mdp !== '') {
      body.mdp = this.registerData.mdp;
    }

    this.http.put<any>(`${API_URL}/users`, body).subscribe({
      next: (profil) => {
        localStorage.setItem('photoprofil', profil.photoprofil);
        this.registerData.mdp = '';
        this.message = 'Profil mis à jour.';
      },
      error: (err: HttpErrorResponse) => {
        this.erreur = err.status === 409
          ? 'Cette adresse mail est déjà utilisée.'
          : 'Vérifie les champs (mot de passe : 6 caractères minimum).';
      }
    });
  }
}
