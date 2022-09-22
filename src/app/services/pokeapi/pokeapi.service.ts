import { Injectable } from '@angular/core';
import { Pokemon, Results, SearchResult, Status } from 'src/app/models';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PokeapiService {
  // Pokeapi URL
  private url = 'https://pokeapi.co/api/v2';

  constructor(private storageService: StorageService) { }

  /**
   * Get list of pokemons
   * @param {number} limit Pokemon limit
   * @returns {Promise<Pokemon>} List of pokemons
   */
  public async getPokemonList(limit: number = 151): Promise<Pokemon[]> {
    // Define path
    const path = `${this.url}/pokemon?limit=${limit}`

    // Get pokemon data from storage
    const pokemons = this.storageService.getPokemonList()

    // If no exist data on storage fetch data from endpoint
    return pokemons ?? fetch(path)
      .then(resp => resp.json()) // parse to json
      .then((resp: SearchResult) => this.fetchPokemonDataByList(resp.results)) // Get pokemon info
  }

  /**
   * Fetch pokemon data from list
   * @param {Results[]} allPokemons All pokemons
   * @returns {Promise<Pokemon[]>} List of pokemon data
   */
  private async fetchPokemonDataByList(allPokemons: Results[]): Promise<Pokemon[]> {
    // Initiate pokemon list
    const pokemons: Pokemon[] = [];

    // Get data for each pokemon
    for (let index = 0; index < allPokemons.length; index++) {
      const pokemon = allPokemons[index];
      pokemons.push(await this.fetchPokemonDataFromUrl(pokemon.url))
    }

    // Save pokemon list
    this.storageService.setPokemonList(pokemons);

    // Return data
    return pokemons;
  }

  /**
   * Fetch pokemon data from URL
   * @param {string} url URL that contains the pokemon data
   * @returns {Promise<Pokemon>} Pokemon data
   */
  private async fetchPokemonDataFromUrl(url: string): Promise<Pokemon> {
    return fetch(url)
      .then(resp => resp.json())
      .then(resp => this.getPokemonData(resp))
  }

  /**
   * Get pokemon data
   * @param {any} data Search result
   * @returns {Pokemon} Pokemon data
   */
  private getPokemonData(data: any): Pokemon {
    return {
      number: data.id,
      name: data.name,
      description: '',
      height: data.height,
      weight: data.weight,
      img: data.sprites.other["official-artwork"].front_default,
      types: this.getPokemonTypes(data),
      moves: this.getPokemonMoves(data),
      status: this.getPokemonStatus(data),
    }
  }

  /**
   * Get pokemon moves
   * @param {any} data Search result
   * @returns {string[]} Types
   */
  private getPokemonMoves(data: any): string[] {
    const moves: string[] = [];
    data.abilities.forEach((value: any) => {
      moves.push(value.ability.name)
    });
    return moves;
  }


  /**
   * Get pokemon types
   * @param {any} data Search result
   * @returns {string[]} Types
   */
  private getPokemonTypes(data: any): string[] {
    const types: string[] = [];
    data.types.forEach((value: any) => {
      types.push(value.type.name)
    });
    return types;
  }

  /**
   * Get pokemon status
   * @param {any} data Search result
   * @returns {Status} Status
   */
  private getPokemonStatus(data: any): Status {
    return {
      hp: data.stats[0].base_stat,
      atk: data.stats[1].base_stat,
      def: data.stats[2].base_stat,
      satk: data.stats[3].base_stat,
      sdef: data.stats[4].base_stat,
      spd: data.stats[5].base_stat,
    };
  }

}
