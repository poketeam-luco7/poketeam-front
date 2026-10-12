import { Component, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent {

  @Input() profil: any;

  httpHeaders: HttpHeaders = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', 'Bearer' + ' ' + localStorage.getItem('accessToken'));

  constructor(private http: HttpClient){}


  selectedProfilePic: string = '/img/pokeball.png'; // Met ton chemin par défaut ici
  isModalOpen: boolean = false;

  availablePics: string[] = [
    '/img/pokeball.png',
    '/img/superball.png',
    '/img/hyperball.png',
    '/img/masterball.png',
  ];


  ngOnInit(){
    this.http.get('http://localhost:3000/auth/profile', {headers : this.httpHeaders} ).subscribe({
      next: (response) => {
        this.profil = response;
        console.log(this.profil);
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


  registerData = {
    mail: '',
    nom: '',
    prenom: '',
    photoProfil: '',
    mdp: ''
  };

  modifierProfil(){
    let body;
    if (this.registerData.mdp = ''){
      body = { mail: this.registerData.mail, nom: this.registerData.nom, prenom: this.registerData.prenom, photoProfil: this.selectedProfilePic}
    }else{
      body = { mail: this.registerData.mail, nom: this.registerData.nom, prenom: this.registerData.prenom, photoProfil: this.selectedProfilePic, mdp: this.registerData.mdp}
    }
    console.log(body);

    this.http.put('http://localhost:3000/users', body, {headers : this.httpHeaders} ).subscribe({
      next: (response) => {
        this.profil = response;
        console.log(this.profil);
      }
    });
  }

}
