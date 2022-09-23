import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  public isListReversed = false;

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
    this.pokeapiService
      .getPokemonList(limit)
      .then(value => {
        this.pokemons = value;
        this.filteredPokemons = this.pokemons;
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
    this.isListReversed = !this.isListReversed;
    this.filteredPokemons = this.filteredPokemons.reverse();
  }

}
