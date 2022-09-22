import { Injectable } from '@angular/core';
import { Pokemon } from 'src/app/models/pokeapi.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
   * Save pokemon data in local storage
   * @param {Pokemon[]} pokemons Pokemon list
   */
  public setPokemonList(pokemons: Pokemon[]) {
    sessionStorage.setItem('pokemons', JSON.stringify(pokemons));
  }

  /**
   * Get pokemon data from local storage
   * @returns {Pokemon[]} Pokemon list
   */
  public getPokemonList(): Pokemon[] {
    const pokemons = sessionStorage.getItem('pokemons');
    return pokemons ? JSON.parse(pokemons) : null
  }
}
