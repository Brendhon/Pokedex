import Dexie, { liveQuery, Table } from 'dexie';
import { Injectable } from '@angular/core';
import { POKEMON_DB } from 'src/app/constants/pokemon';
import { environment } from 'src/environments/environment';
import { Pokemon } from 'src/app/models';

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  private pokemon!: Table<Pokemon, number>;
  public pokemon$ = liveQuery(() => this.getPokemonByGeneration());

  constructor() {
    super(POKEMON_DB);
    this.version(environment.dbVersion).stores({
      pokemon: 'id, name, gen'
    });

    //opening the database
    this.open()
      .then(data => console.log("DB Opened"))
      .catch(err => console.log(err.message));
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
  public getPokemonByGeneration(genId: number = 1): Promise<Pokemon[]> {
    return this.pokemon
      .where({ gen: genId })
      .toArray();
  }

  /**
   * Get Pokemon list
   * @returns {Promise<Pokemon[]>} Pokemon list
   */
  public getPokemonList(): Promise<Pokemon[]> {
    return this.pokemon.toArray();
  }

  /**
   * Check if has pokemon list
   * @returns {Promise<boolean>} true if exist pokemon list
   */
  public async hasPokemonList(): Promise<boolean> {
    return (await this.pokemon.count()) > 0;
  }
}
