import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LIST_ORDER_OPTIONS } from './models/pokeapi.enum';
import { Pokemon } from './models/pokeapi.model';
import { PokeapiService } from './services/pokeapi/pokeapi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title = 'Pokédex';
  public search = new FormControl(''); // From input
  public pokemons: Pokemon[] = []; // List with all Pokemons
  public filteredPokemons: Pokemon[] = [] // List with filtered Pokemons
  public limit = 151; // Limit of pokemons
  public isListEmpty = false;
  public listOrder: LIST_ORDER_OPTIONS = LIST_ORDER_OPTIONS.NORMAL;
  public listOrderOptions = LIST_ORDER_OPTIONS;
  public selectedPokemon: Pokemon | undefined;
  public isLoading: boolean = false;

  constructor(private pokeapiService: PokeapiService) { }

  ngOnInit(): void {
    this.getPokemonList(); // Get pokemon list
    this.searchSub(); // Listen to research
  }

  /**
   * Get pokemon list
   * @param {number} limit Limit of pokemons
   */
  public getPokemonList(limit: number = this.limit): void {
    this.isLoading = true;
    this.pokeapiService
      .getPokemonList(limit)
      .then(value => {
        this.pokemons = value;
        this.filteredPokemons = this.pokemons;
        this.selectedPokemon = value[0];
        this.isLoading = false;
      })
  }

  /**
   * Subscribe to listen to searches
   */
  private searchSub(): void {
    this.search
      .valueChanges
      .subscribe(value => {
        // Get term search
        const searchTerm = value?.trim().toLowerCase() ?? '';
        const hasValue = !!searchTerm; // Check if exist text

        // Update pokemon list
        this.filteredPokemons = hasValue
          ? this.pokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm))
          : this.pokemons;

        // Check if list is empty
        this.isListEmpty = this.filteredPokemons.length === 0;
      })
  }

  /**
   * Toggle List Order
   */
  public toggleListOrder() {
    switch (this.listOrder) {
      case LIST_ORDER_OPTIONS.NORMAL:
        this.listOrder = LIST_ORDER_OPTIONS.ASC;
        this.filteredPokemons = this.filteredPokemons.sort((a, b) => a.name.localeCompare(b.name))
        break;

      default:
        this.listOrder = LIST_ORDER_OPTIONS.NORMAL;
        this.filteredPokemons = this.filteredPokemons.sort((a, b) => a.id - b.id);
        break;
    }
  }

  /**
   * Select a pokemon
   * @param {Pokemon} pokemon Selected pokemon
   */
  public selectPokemon(pokemon: Pokemon) {
    this.selectedPokemon = pokemon;
  }

  /**
   * Update Selected Pokemon
   * @param {number | undefined} pokemonId Pokemon id
   */
  public updateSelectedPokemon(pokemonId: number | undefined): void {
    switch (true) {
      case pokemonId == undefined:
        this.selectedPokemon = undefined;
        break;
      case pokemonId! > this.limit:
        this.selectedPokemon = this.pokemons.find(value => value.id == 1);
        break;
      case pokemonId! == 0:
        this.selectedPokemon = this.pokemons.find(value => value.id == this.limit);
        break;
      default:
        this.selectedPokemon = this.pokemons.find(value => value.id == pokemonId)
        break;
    }
  }
}
