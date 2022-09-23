import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pokemonWeight'
})
export class PokemonWeightPipe implements PipeTransform {

  transform(value: number): string {
    return`${value/10} kg`.replace('.', ',');
  }

}
