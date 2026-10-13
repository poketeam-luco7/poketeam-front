import { Pipe, PipeTransform } from '@angular/core';
import { TYPES_FR } from './pokemon-types';

// Espèces dont la forme se nomme d'après un type : 'arceus-fire' -> 'Arceus Feu'
const FORMES_PAR_TYPE = ['arceus', 'silvally'];

/**
 * Affiche un nom PokéAPI lisible :
 *   'charizard-mega-x' -> 'Charizard Méga X', 'mr-mime' -> 'Mr Mime'
 */
@Pipe({ name: 'nomPokemon', standalone: false })
export class NomPokemonPipe implements PipeTransform {
  transform(nom: string | null | undefined): string {
    if (!nom) return '';
    const mots = nom.split('-');
    const parType = FORMES_PAR_TYPE.includes(mots[0]);
    return mots
      .map(mot => {
        if (mot === 'mega') return 'Méga';
        if (parType && TYPES_FR[mot]) return TYPES_FR[mot];
        return mot.charAt(0).toUpperCase() + mot.slice(1);
      })
      .join(' ');
  }
}
