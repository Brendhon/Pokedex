import { Injectable } from '@angular/core';
import { DEFAULT_GENERATION, POKEMON_GENERATIONS } from 'src/app/constants/pokemon';
import { Generation, Pokemon, PokemonSpecies, Results, SearchResult, Status } from 'src/app/models';
import { environment } from 'src/environments/environment';
import { DbService } from '../db/db.service';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  // Pokeapi URL
  private url = environment.pokeApiUrl;
  private currentGeneration!: Generation;

  constructor(private db: DbService) {
    this.setCurrentGeneration(DEFAULT_GENERATION)
   }

  /**
   * Get list of pokemons
   * @param {number} genId Generation info
   * @returns {Promise<Pokemon>} List of pokemons
   */
  public async fetchPokemonList(genId: number): Promise<void> {
    // Find generation info
    const gen = POKEMON_GENERATIONS.find(gen => gen.id == genId)!;

    // Define path
    const path = `${this.url}/pokemon?offset=${gen.offset}&limit=${gen.limit}`

    // If no exist data on storage fetch data from endpoint
    return fetch(path)
      .then(resp => resp.json()) // parse to json
      .then((resp: SearchResult) => this.fetchPokemonDataByList(resp.results)) // Get pokemon info
  }

  /**
   * Fetch pokemon data from list
   * @param {Results[]} allPokemons All pokemons
   * @returns {Promise<Pokemon[]>} List of pokemon data
   */
  private async fetchPokemonDataByList(allPokemons: Results[]): Promise<void> {
    // Initiate pokemon list
    const promises = [];

    // Get data for each pokemon
    for (let index = 0; index < allPokemons.length; index++) {
      const pokemon = allPokemons[index];
      promises.push(this.fetchPokemonDataFromUrl(pokemon.url))
    }

    // Execute all promises
    return Promise.allSettled(promises).then((results: PromiseSettledResult<Pokemon>[]) => {
      // Get all pokemons that has some value
      const pokemons: Pokemon[] = results
        .filter(result => result.status == 'fulfilled')
        .map((result: any) => result.value)

      this.db.savePokemonList(pokemons);
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
      .then(resp => this.pokemonFactory(resp))
  }

  /**
   * Form pokemon data
   * @param {any} data Request data
   * @returns {Pokemon} Pokemon data
   */
  private async pokemonFactory(data: any): Promise<Pokemon> {
    // Get pokemon info from Pokemon species
    const { description, isBaby, isLegendary, isMythical } = await this.getPokemonInfo(data.id);

    // Get pokemon img
    const img = await this.getPokemonImg(data.sprites.other["official-artwork"].front_default)

    // Form pokemon data
    return {
      id: data.id,
      name: data.name,
      description,
      img,
      isLegendary,
      isBaby,
      isMythical,
      isFavorite: 0,
      height: data.height,
      weight: data.weight,
      number: this.getPokemonNumber(data),
      types: this.getPokemonTypes(data),
      moves: this.getPokemonMoves(data),
      status: this.getPokemonStatus(data),
      colors: this.getPokemonColors(data),
      gen: this.getPokemonGeneration(data),
    }
  }

  /**
   * Download and store an image
   * @param {string} url URL
   * @returns {Promise<Blob>} Blob
   */
  private async getPokemonImg(url: string): Promise<Blob> {
    return fetch(url).then(res => res?.blob())
  }

  /**
   * Get Pokemon details from pokemon-species
   * @param {number} id Pokemon id
   * @returns {string} Pokemon details
   */
  private async getPokemonInfo(id: number): Promise<PokemonSpecies> {
    // Define path
    const path = `${this.url}/pokemon-species/${id}`

    // Fetch pokemon description
    return fetch(path)
      .then(resp => resp.json())
      .then(resp => {
        return {
          description: this.getPokemonDesc(resp),
          isLegendary: resp.is_legendary,
          isMythical: resp.is_mythical,
          isBaby: resp.is_baby,
        }
      })
  }

  /**
   * Get Pokemon Desc
   * @param {any} data Request data
   * @returns {string} Pokemon description
   */
  public getPokemonDesc(data: any): string {
    const description = data.flavor_text_entries
      .find((value: any) => value.version.name === 'firered')
    return description?.flavor_text ?? data?.flavor_text_entries[0]?.flavor_text ?? '';
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
   * Get pokemon generation
   * @param {any} data Search result
   * @returns {string} generation
   */
  private getPokemonGeneration(data: any): number {
    const pokemonId = data.id;
    return POKEMON_GENERATIONS.find(gen => pokemonId > gen.offset && pokemonId <= gen.until && gen.id !== 0)!.id;
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

  /**
   * Get card id
   * @returns {string} Card id
   */
  public getCardId(pokemon: Pokemon): string {
    return 'card-' + pokemon?.name;
  }
}
