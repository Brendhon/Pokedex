import Dexie, { liveQuery, Observable, Table } from 'dexie';
import { Injectable } from '@angular/core';
import { DEFAULT_GENERATION, POKEMON_DB } from 'src/app/constants/pokemon';
import { environment } from 'src/environments/environment';
import { Pokemon } from 'src/app/models';

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  private pokemon!: Table<Pokemon, number>;

  constructor() {
    super(POKEMON_DB);
    this.version(environment.dbVersion).stores({
      pokemon: 'id, gen'
    });
  }

  /**
   * Opening the database
   * @returns {Promise}
   */
  public openDB(): Promise<any> {
    return this.open();
  }

  /**
   * Add pokemon to database
   * @param {Pokemon[]} pokemonList
   */
  public async savePokemonList(pokemonList: Pokemon[]): Promise<void> {
    this.pokemon
      .bulkAdd(pokemonList)
      .catch(err => console.log(err.message));
  }

  /**
   * Get Pokemon By Generation
   * @param {number} genId Generation id
   * @returns {Promise<Pokemon[]>} Pokemon list
   */
  public getPokemonByGen(genId: number = DEFAULT_GENERATION): Promise<Pokemon[]> {
    return this.pokemon.where({ gen: genId }).toArray()
  }

  /**
   * Check if has pokemon list
   * @param {number} genId Generation id
   * @returns {Promise<boolean>} true if exist pokemon list
   */
  public async hasPokemonList(genId: number = DEFAULT_GENERATION): Promise<boolean> {
    return (await this.pokemon.where({ gen: genId }).count()) > 0;
  }
}
