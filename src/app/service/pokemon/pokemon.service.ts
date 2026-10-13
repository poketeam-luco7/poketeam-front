import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../api.config';

export interface PokemonResume {
  id: number | string;   // les formes par type (ex. 'arceus-fire') sont identifiées par leur nom
  name: string;
  image: string;
  types: string[];
  isMega: boolean;
  isForm: boolean;
  baseSpecies: string;
}

// Le Pokédex renvoie { id, name, sprite, types, isMega } : on garde le nom "image" utilisé par les vues
const versResume = (list: any[]): PokemonResume[] =>
  list.map(p => ({
    id: p.id, name: p.name, image: p.sprite, types: p.types,
    isMega: !!p.isMega, isForm: !!p.isForm, baseSpecies: p.baseSpecies || p.name,
  }));

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http: HttpClient) {}

  // Chaque Pokémon est suivi de ses formes alternatives (Giratina, Giratina Origine...)
  getGeneration(num: number): Observable<PokemonResume[]> {
    return this.http.get<any[]>(`${API_URL}/pokeapi/generation/${num}`).pipe(map(versResume));
  }

  getMegas(): Observable<PokemonResume[]> {
    return this.http.get<any[]>(`${API_URL}/pokeapi/megas`).pipe(map(versResume));
  }

  // Tous les Pokémon d'un type, toutes générations confondues
  getByType(type: string): Observable<PokemonResume[]> {
    return this.http.get<any[]>(`${API_URL}/pokeapi/type/${type}/pokemon`).pipe(map(versResume));
  }

  // Détail complet (sprites shiny, attaques) : lu directement sur PokéAPI
  getPokemonDetails(id: string): Observable<any> {
    return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${id}`);
  }
}
