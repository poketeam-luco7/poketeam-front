import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_URL } from './api.config';
import { AuthService } from './service/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  private loginModal: any;
  isConnecter : boolean = false; // faux par défaut
  photoProfil : any; // chemin de l'image de profil
  loginError = '';

  registerData = {
    mail: '',
    mdp: '',
  };

  ngOnInit() {
    this.isConnecter = this.auth.isLoggedIn();
    if (this.isConnecter) {
      this.photoProfil = localStorage.getItem('photoprofil');
    }
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('loginModal');
    this.loginModal = new bootstrap.Modal(modalEl);
  }

  openLoginModal() {
    // Correctif : on ne passe plus isConnecter à true avant d'être réellement connecté
    this.loginError = '';
    this.loginModal.show();
  }

  login() {
    this.loginError = '';
    this.http.post<{ accessToken: string, user : any }>(`${API_URL}/auth/login`, this.registerData).subscribe({
      next: (response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('photoprofil', response.user.photoprofil);
        this.isConnecter = true;
        this.photoProfil = response.user.photoprofil;
        this.loginModal.hide();
        location.href = '/liste-equipes';
      },
      error: () => {
        this.loginError = 'Adresse mail ou mot de passe incorrect.';
      }
    });
  }

  logout(){
    this.auth.logout();
  }
}

declare var bootstrap: any; // pour accéder à la modale bootstrap via JS
