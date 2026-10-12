import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';  // Importation de ActivatedRoute
import { PokemonService } from '../service/pokemon/pokemon.service';  // Importation du service pour récupérer les données Pokémon
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pokemon-detail',
  standalone: false,
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.css']
})
export class PokemonDetailComponent implements OnInit {
  pokemon: any;  // Cette variable stockera les détails du Pokémon
  movesDetails: any[] = [];

  constructor(
    private route: ActivatedRoute,  // Injecter ActivatedRoute pour récupérer l'ID
    private pokemonService: PokemonService, // Injection du service Pokémon pour récupérer les détails
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du Pokémon depuis l'URL
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Appeler le service pour récupérer les détails du Pokémon en utilisant l'ID
      this.pokemonService.getPokemonDetails(id).subscribe((data: any) => {
        this.pokemon = data;  // Affecter les données du Pokémon à la variable pokemon
        this.loadMovesDetails();
        console.log('Détails du Pokémon:', this.pokemon);
      });
    }
  }

  getTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'normal': return 'bg-normal';
      case 'fire': return 'bg-fire';
      case 'water': return 'bg-water';
      case 'electric': return 'bg-electric';
      case 'grass': return 'bg-grass';
      case 'ice': return 'bg-ice';
      case 'fighting': return 'bg-fighting';
      case 'poison': return 'bg-poison';
      case 'ground': return 'bg-ground';
      case 'flying': return 'bg-flying';
      case 'psychic': return 'bg-psychic';
      case 'bug': return 'bg-bug';
      case 'rock': return 'bg-rock';
      case 'ghost': return 'bg-ghost';
      case 'dragon': return 'bg-dragon';
      case 'dark': return 'bg-dark';
      case 'steel': return 'bg-steel';
      case 'fairy': return 'bg-fairy';
      default: return 'bg-secondary'; 
    }
  }

  loadMovesDetails() {
    const moves = this.pokemon.moves;
    moves.forEach((moveInfo: any) => {
      this.http.get<any>(moveInfo.move.url).subscribe(moveData => {
        this.movesDetails.push({
          name: moveData.name,
          type: moveData.type.name,
          power: moveData.power,
          accuracy: moveData.accuracy,
          
        });
      });
    });
  }
}
