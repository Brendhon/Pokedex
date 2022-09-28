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
    const promises = [];

    // Get data for each pokemon
    for (let index = 0; index < allPokemons.length; index++) {
      const pokemon = allPokemons[index];
      promises.push(this.fetchPokemonDataFromUrl(pokemon.url))
    }

    // Execute all promises
    return Promise.all(promises).then((pokemons: Pokemon[]) => {
      // Save pokemon list
      this.storageService.setPokemonList(pokemons);
      // Return data
      return pokemons;
    })
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
      id: data.id,
      name: data.name,
      description: '',
      height: data.height,
      weight: data.weight,
      img: data.sprites.other["official-artwork"].front_default,
      number: this.getPokemonNumber(data),
      types: this.getPokemonTypes(data),
      moves: this.getPokemonMoves(data),
      status: this.getPokemonStatus(data),
      colors: this.getPokemonColors(data),
    }
  }

  /**
   * Get pokemon colors
   * @param {any} data Search result
   * @returns {string[]} Colors
   */
  private getPokemonColors(data: any): string[] {
    // Initiate variables
    const colors: string[] = []
    const types = this.getPokemonTypes(data);

    // For each type get current color
    types.forEach(type => {
      const color = getComputedStyle(document.documentElement).getPropertyValue(`--${type}-color`);
      colors.push(color.trim());
    })

    // Return colors
    return colors;
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

  /**
   * Get pokemon number
   * @param {any} data Search result
   * @returns {string} number
   */
  public getPokemonNumber(data: any): string {
    const number = `${data.id}`;
    switch (number.length) {
      case 1:
        return `#00${number}`;
      case 2:
        return `#0${number}`;
      default:
        return `#${number}`;
    }
  }

}
