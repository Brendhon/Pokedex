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
  private favorites!: Table<Pokemon, number>;

  constructor() {
    super(POKEMON_DB);
    this.version(environment.dbVersion).stores({
      pokemon: 'id, gen, [gen+isFavorite]',
      favorites: 'id, gen',
    });
  }

  /**
   * Opening the database
   * @returns {Promise}
   */
  public async openDB(): Promise<any> {
    // Get version
    const version = environment.dbVersion;

    // Check if is already open
    if (this.isOpen()) return super.open();

    // Open
    return Dexie.Promise.resolve()
      .then(() => Dexie.exists(this.name)) // Check if exist
      .then((exists) => {
        // No need to check database version since it doesn't exist
        if (!exists) return;

        // Open separate instance of dexie to get current database version
        return new Dexie(this.name).open()
          .then(async db => {
            // database up to date (or newer)
            if (db.verno >= version) return db.close();

            console.log(`Database schema out of date, resetting all data. (currentVersion: ${db.verno}, expectedVersion: ${version})`);
            await db.delete();

            // ensure the delete was successful
            const exists = await Dexie.exists(this.name);
            if (exists) {
              throw new Error('Failed to remove mock backend database.');
            }
          })
      })
      .then(() => super.open());
  }

  // ------------------- START - POKEMON TABLE -------------------

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
   * @param {(0 | 1)} isFavorite is favorite
   * @returns {Promise<Pokemon[]>} Pokemon list
   */
  public getPokemonByGen(genId: number = DEFAULT_GENERATION, isFavorite?: (0 | 1)): Promise<Pokemon[]> {
    return isFavorite !== undefined
      ? this.pokemon.where({ gen: genId, isFavorite: isFavorite }).toArray()
      : this.pokemon.where({ gen: genId }).toArray()
  }

  /**
   * Check if has pokemon list
   * @param {number} genId Generation id
   * @returns {Promise<boolean>} true if exist pokemon list
   */
  public async hasPokemonList(genId: number = DEFAULT_GENERATION): Promise<boolean> {
    return (await this.pokemon.where({ gen: genId }).count()) > 0;
  }

  /**
   * Update Favorite Pokemon
   * @param {number} pokemonId
   * @param {(0 | 1)} isFavorite is favorite
   */
  public async updateFavoritePokemon(pokemonId: number, isFavorite: (0 | 1)): Promise<void> {
    this.pokemon
      .update(pokemonId, { isFavorite: isFavorite })
      .catch(err => console.log(err.message));
  }
  // ------------------- END - POKEMON TABLE -------------------

  // ------------------- START - FAVORITE TABLE -------------------
  /**
   * Add pokemon to database
   * @param {Pokemon} pokemon
   */
  public async favoritePokemon(pokemon: Pokemon): Promise<void> {
    this.favorites
      .add(pokemon)
      .catch(err => console.log(err.message));
  }

  /**
   * Delete pokemon from database
   * @param {number} pokemonId
   */
  public async unfavoritePokemon(pokemonId: number): Promise<void> {
    this.favorites
      .delete(pokemonId)
      .catch(err => console.log(err.message));
  }

  /**
   * Delete pokemon from database
   * @returns {Observable<Pokemon[]>} Favorites pokemons
   */
  public fetchFavorites(): Observable<Pokemon[]> {
    return liveQuery(() => this.favorites.toArray());
  }
  // ------------------- END - FAVORITE TABLE -------------------
}
