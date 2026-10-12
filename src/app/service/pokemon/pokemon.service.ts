import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private apiUrl = 'http://localhost:3000/pokeapi/generation/1'; 
  //private apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1025'; 

  constructor(private http: HttpClient) {}

  getPokemons(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.map((poke : any) => ({
        name: poke[0],
        image: poke[1], 
        types: poke[2]  
      }))
      )
    );
  }

  getPokemonDetails(id: string): Observable<any> {
    return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${id}`).pipe(
      map(response => response)  // Retourne la réponse complète du Pokémon
    );
  }
}
