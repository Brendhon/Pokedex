import { Injectable } from '@angular/core';
import { POKEMON_STORAGE } from 'src/app/constants/pokemon';
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
  public setPokemonList(pokemons: Pokemon[], genId: number) {
    localStorage.setItem(`${POKEMON_STORAGE}_${genId}gen`, JSON.stringify(pokemons));
  }

  /**
   * Get pokemon data from local storage
   * @returns {Pokemon[]} Pokemon list
   */
  public getPokemonList(genId: number): Pokemon[] {
    const pokemons = localStorage.getItem(`${POKEMON_STORAGE}_${genId}gen`);
    return pokemons ? JSON.parse(pokemons) : null
  }
}
