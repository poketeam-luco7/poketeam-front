import { Pipe, PipeTransform } from '@angular/core';

/**
 * Affiche un nom PokéAPI lisible :
 *   'charizard-mega-x' -> 'Charizard Méga X', 'mr-mime' -> 'Mr Mime'
 */
@Pipe({ name: 'nomPokemon', standalone: false })
export class NomPokemonPipe implements PipeTransform {
  transform(nom: string | null | undefined): string {
    if (!nom) return '';
    return nom
      .split('-')
      .map(mot => (mot === 'mega' ? 'Méga' : mot.charAt(0).toUpperCase() + mot.slice(1)))
      .join(' ');
  }
}
