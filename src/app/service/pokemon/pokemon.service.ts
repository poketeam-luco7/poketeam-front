import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../api.config';

export interface PokemonResume {
  id: number;
  name: string;
  image: string;
  types: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http: HttpClient) {}

  // Le Pokédex renvoie des objets { id, name, sprite, types } (plus de tableaux imbriqués)
  getGeneration(num: number): Observable<PokemonResume[]> {
    return this.http.get<any[]>(`${API_URL}/pokeapi/generation/${num}`).pipe(
      map(list => list.map(p => ({ id: p.id, name: p.name, image: p.sprite, types: p.types })))
    );
  }

  // Détail complet (sprites shiny, attaques) : lu directement sur PokéAPI
  getPokemonDetails(id: string): Observable<any> {
    return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${id}`);
  }
}
