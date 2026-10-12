import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../service/auth/auth.service';


@Component({
  selector: 'app-equipes-liste',
  standalone: false,
  templateUrl: './equipes-liste.component.html',
  styleUrl: './equipes-liste.component.css'
})
export class EquipesListeComponent {
teams: any;
token : any = localStorage.getItem('accessToken');
httpHeaders: HttpHeaders = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', 'Bearer' + ' ' + localStorage.getItem('accessToken'));
  
  constructor(private http: HttpClient){}

  ngOnInit(){

    this.http.get('http://localhost:3000/teams', {headers : this.httpHeaders} ).subscribe({
      next: (response) => {
        this.teams = response;
      }
    });

    //console.log(this.teams);
  }




 /*teams = [
    {
      pokemons: [
        { name: 'pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
        { name: 'bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
        { name: 'charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
        { name: 'squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' }
        // 4 pokémons → donc 4 cercles
      ]
    },
    {
      pokemons: [
        { name: 'mewtwo', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
        { name: 'dragonite', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png' }
        // 2 pokémons → donc 2 cercles
      ]
    }
  ];*/
  
  // temporaire, à remplacer plus tard par les vraies teams

  createTeam() {
    console.log('Créer une nouvelle équipe');
  }

  /*addPokemon(team: any) {
    if (team.pokemons.length < 6) {
      team.pokemons.push({
        name: 'nouveau',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
      });
    } else {
      alert('Votre équipe est complète ! (6 Pokémon max)');
    }
  }*/
  
}