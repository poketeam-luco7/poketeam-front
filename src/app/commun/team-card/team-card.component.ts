import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-team-card',
  standalone: false,
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.css']
})
export class TeamCardComponent {
  @Input() team: any; // on reçoit une team en entrée
  @Input() pokeResultArray: any;
  @Output() addPokemonToTeam = new EventEmitter<any>(); // <== NOUVEAU

  httpHeaders: HttpHeaders = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', 'Bearer' + ' ' + localStorage.getItem('accessToken'));


  constructor(private http: HttpClient){}



  ngOnInit(){
    let pokeIdArray = [this.team.poke1, this.team.poke2, this.team.poke3, this.team.poke4, this.team.poke5, this.team.poke6];
    this.pokeResultArray = new Array();

    pokeIdArray.forEach(element => {


      this.http.get('http://localhost:3000/pokeapi/poke/' + element, {headers : this.httpHeaders} ).subscribe({
        next: (response) => {
          this.pokeResultArray.push(response);
        }
      });


    });

    console.log(this.pokeResultArray);
  }

  onAddPokemon() {
    this.addPokemonToTeam.emit(this.team); // On envoie l'équipe
  }

  supprimerTeam(id: number){

    this.http.delete('http://localhost:3000/teams/' + id).subscribe({
      next: (response) => {
        console.log(response);
      }
  })

  location.reload();
  }
}


