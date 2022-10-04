import Dexie, { liveQuery, Table } from 'dexie';
import { Injectable } from '@angular/core';
import { POKEMON_DB } from 'src/app/constants/pokemon';
import { environment } from 'src/environments/environment';
import { Generation, Pokemon } from 'src/app/models';

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  private pokemon!: Table<Pokemon, number>;
  pokemon$ = liveQuery(() => this.getPokemonList());

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
   * @param {Generation} gen Generation info
   * @returns {Promise<Pokemon[]>} Pokemon list
   */
  public getPokemonByGeneration(gen: Generation): Promise<Pokemon[]> {
    return this.pokemon
      .where({ gen: gen.id })
      .toArray();
  }

  /**
   * Get Pokemon By name
   * @param {string} name Pokemon name
   * @returns {Promise<Pokemon[]>} Pokemon list
   */
  public getPokemonByName(name: string): Promise<Pokemon[]> {
    return this.pokemon
      .where("name")
      .startsWithIgnoreCase(name)
      .toArray();
  }

  /**
   * Get Pokemon By name
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
