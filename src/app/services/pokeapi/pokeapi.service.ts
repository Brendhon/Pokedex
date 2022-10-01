import { Injectable } from '@angular/core';
import { POKEMON_GENERATIONS } from 'src/app/constants/pokemon';
import { Generation, Pokemon, Results, SearchResult, Status } from 'src/app/models';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PokeapiService {
  // Pokeapi URL
  private url = 'https://pokeapi.co/api/v2';
  private currentGeneration: Generation = POKEMON_GENERATIONS[0];

  constructor(private storageService: StorageService) { }

  /**
   * Get list of pokemons
   * @param {number} limit Pokemon limit
   * @returns {Promise<Pokemon>} List of pokemons
   */
  public async getPokemonList(gen: Generation = this.currentGeneration): Promise<Pokemon[]> {

    // Define path
    const path = `${this.url}/pokemon?offset=${gen.offset}&limit=${gen.limit}`

    // Get pokemon data from storage
    const pokemons = this.storageService.getPokemonList(gen.id)

    // If no exist data on storage fetch data from endpoint
    return pokemons ?? fetch(path)
      .then(resp => resp.json()) // parse to json
      .then((resp: SearchResult) => this.fetchPokemonDataByList(resp.results, gen.id)) // Get pokemon info
  }

  /**
   * Fetch pokemon data from list
   * @param {Results[]} allPokemons All pokemons
   * @returns {Promise<Pokemon[]>} List of pokemon data
   */
  private async fetchPokemonDataByList(allPokemons: Results[], genId: number): Promise<Pokemon[]> {
    // Initiate pokemon list
    const promises = [];

    // Get data for each pokemon
    for (let index = 0; index < allPokemons.length; index++) {
      const pokemon = allPokemons[index];
      promises.push(this.fetchPokemonDataFromUrl(pokemon.url))
    }

    // Execute all promises
    return Promise.allSettled(promises).then((results: PromiseSettledResult<Pokemon>[]) => {
      // Initiate pokemons flag
      const pokemons: Pokemon[] = [];

      // Get all pokemons that has some value
      results.forEach(result => {
        result.status == 'fulfilled'
          ? pokemons.push(result.value)
          : this.handleError(result);
      })

      // Save pokemon list on storage
      this.storageService.setPokemonList(pokemons, genId);

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
  private async getPokemonData(data: any): Promise<Pokemon> {
    return {
      id: data.id,
      name: data.name,
      description: await this.getPokemonDescription(data.id),
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
   * Get Pokemon Description
   * @param {number} id Pokemon id
   * @returns {string} Pokemon description
   */
  private async getPokemonDescription(id: number): Promise<string> {
    // Define path
    const path = `${this.url}/pokemon-species/${id}`

    // Fetch pokemon description
    return fetch(path)
      .then(resp => resp.json())
      .then(resp => {
        const description = resp.flavor_text_entries
          .find((value: { version: { name: string; }; }) => value.version.name === 'firered')
        return description?.flavor_text ?? '';
      })
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

  /**
   * Handle Error
   * @param {PromiseRejectedResult} error
   */
  private handleError(error: PromiseRejectedResult): void {
    console.log(error.reason)
  }

  /**
   * Set Current Generation
   * @param {number} genId Generation id
   */
  public setCurrentGeneration(genId: number): void {
    this.currentGeneration = POKEMON_GENERATIONS.find(value => value.id == genId)!;
  }

  /**
   * Get Current Generation
   * @returns {Generation} Generation
   */
  public getCurrentGeneration(): Generation {
    return this.currentGeneration;
  }
}
