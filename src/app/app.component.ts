import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  constructor(private http: HttpClient, private router: Router) {
    
    
  }

  
  private loginModal: any;
  isConnecter : boolean = false; // faux par défaut
  photoProfil : any; // chemin de l'image de profil

  ngOnInit() {
    if(localStorage.getItem('accessToken') != null){
      this.isConnecter = true;
      this.photoProfil = localStorage.getItem('photoprofil');
    } else {
      this.isConnecter = false;
    }
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('loginModal');
    this.loginModal = new bootstrap.Modal(modalEl);
  }

  openLoginModal() {
    this.loginModal.show();
    this.isConnecter = true;
  }

  registerData = {
    mail: '',
    mdp: '',
  };

  

  login() {
    console.log('Tentative de connexion avec :', this.registerData.mail, this.registerData.mdp);
  
    this.http.post<{ accessToken: string, user : any }>('http://localhost:3000/auth/login', this.registerData).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);       
        localStorage.setItem('accessToken', response.accessToken);
        this.isConnecter = true;
        this.photoProfil = response.user.photoprofil;
        localStorage.setItem('photoprofil', response.user.photoprofil);
        this.loginModal.hide();
        location.reload();
      },
      error: (error) => {
        console.error('Erreur lors de la connexion', error);
      }
    });
    
  }



  logout(){
    localStorage.clear();
    location.reload();
  }
  
    

  
}

  


declare var bootstrap: any; // pour accéder à la modale bootstrap via JS



  

