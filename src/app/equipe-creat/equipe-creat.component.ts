import { Component } from '@angular/core';
import { PokemonService } from '../service/pokemon/pokemon.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';
@Component({
  selector: 'app-equipe-creat',
  standalone: false,
  templateUrl: './equipe-creat.component.html',
  styleUrl: './equipe-creat.component.css'
})
export class EquipeCreatComponent {
  searchText: string = '';
  allPokemons: any[] = [];
  pokemons: any[] = [];
  equipe: any[] = [null, null, null, null, null, null];
  id: number = 1;
  types: string[] = [];
  typeIndex: number = 0;
  currentType: any;
  nomEquipe: string = '';
  enregistrement = false;

  constructor(private pokemonService: PokemonService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.pokemonService.getGeneration(this.id).subscribe((data: any[]) => {
      this.allPokemons = data;
      this.pokemons = [...this.allPokemons];

    const uniqueTypes = new Set<string>();  // Utilisation d'un Set pour garantir l'unicité
    this.allPokemons.forEach((poke: any) => {
      poke.types.forEach((type: string) => {
        uniqueTypes.add(type);
      });
    });
    
    this.types = Array.from(uniqueTypes);  // Convertir le Set en tableau
  });
  }

  newTeam(): void{
    // Correctif : le nom est maintenant lié au champ (il n'était jamais envoyé)
    if (!this.nomEquipe.trim()) {
      alert("Donne un nom à ton équipe.");
      return;
    }
    if (this.equipe.includes(null)) {
      alert('Votre équipe doit contenir 6 Pokémon.');
      return;
    }

    const data = {
      nom: this.nomEquipe.trim(),
      typePrincipal: this.currentType || '',
      poke1: this.equipe[0]?.id,
      poke2: this.equipe[1]?.id,
      poke3: this.equipe[2]?.id,
      poke4: this.equipe[3]?.id,
      poke5: this.equipe[4]?.id,
      poke6: this.equipe[5]?.id,
    };

    this.enregistrement = true;
    this.http.post(`${API_URL}/teams`, data).subscribe({
      next: () => {
        this.router.navigate(['/liste-equipes']);
      },
      error: (err) => {
        this.enregistrement = false;
        alert(err.error?.error || "Erreur lors de l'enregistrement de l'équipe.");
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/liste-equipes']);
  }

  retirerDeLEquipe(index: number): void {
    this.equipe[index] = null;
  }

  filterByType(type: string): void {
    // Si aucun type n'est sélectionné, on réinitialise et on montre tous les Pokémon
    if (type === 'all') {
      this.pokemons = [...this.allPokemons];
    } else {
      this.pokemons = this.allPokemons.filter(poke =>
        poke.types.includes(type)
      );
    }
  }

  changeGeneration() {
    if(this.id <9) {
      this.id += 1;
    } else {
      this.id = 1;
    }
    this.currentType = undefined;

    this.pokemonService.getGeneration(this.id).subscribe((data: any[]) => {
      this.allPokemons = data;
      this.pokemons = [...this.allPokemons];
    });
  }

  filterPokemons(): void {
  const search = this.searchText.toLowerCase();
  
  this.pokemons = this.allPokemons.filter(poke => {
    const matchesName = poke.name.toLowerCase().includes(search);
    const matchesType = this.currentType ? poke.types.includes(this.currentType) : true;
    
    return matchesName && matchesType;
  });
}

  addToTeam(pokemon: any) {
    const firstEmptyIndex = this.equipe.findIndex(member => member === null);
  
    if (firstEmptyIndex !== -1) {
      this.equipe[firstEmptyIndex] = pokemon;
    } else {
      alert('Équipe complète !');
    }
  }

  viewDetails(pokemon: any): void {
    this.router.navigate(['/pokemon', pokemon.id]);
  }

  getTypeColor(type: string | undefined): string {
    if (!type) {
      return 'bg-secondary'; // couleur par défaut
    }
  
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
  
  typeSuivant(): void {
  this.typeIndex = (this.typeIndex + 1) % this.types.length;
  this.currentType = this.types[this.typeIndex];
  this.filterPokemonsByType();
  }

  filterPokemonsByType() {
    if (!this.currentType) {
      this.pokemons = [...this.allPokemons]; // Aucun filtre
    } else {
      this.pokemons = this.allPokemons.filter(poke =>
        poke.types.includes(this.currentType)
      );
    }
  }
}
