import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pokemonHeight'
})
export class PokemonHeightPipe implements PipeTransform {

  transform(value: number): string {
    return`${value/10} m`.replace('.', ',');
  }

}
