import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { POKEMON_GENERATIONS, POKEMON_LIMIT } from './constants/pokemon';
import { LIST_ORDER_OPTIONS } from './models/pokeapi.enum';
import { Generation, Pokemon } from './models/pokeapi.model';
import { PokeapiService } from './services/pokeapi/pokeapi.service';
import { trigger, transition, animate, style } from '@angular/animations'
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]
    )
  ],
})
export class AppComponent implements OnInit {
  public title = 'Pokédex';
  public search = new FormControl(''); // From input
  public pokemons: Pokemon[] = []; // List with all Pokemons
  public filteredPokemons: Pokemon[] = [] // List with filtered Pokemons
  public isListEmpty = false;
  public listOrder: LIST_ORDER_OPTIONS = LIST_ORDER_OPTIONS.NORMAL;
  public listOrderOptions = LIST_ORDER_OPTIONS;
  public generationsOptions = POKEMON_GENERATIONS;
  public selectedGenerations: Generation = POKEMON_GENERATIONS[0];
  public selectedPokemon: Pokemon | undefined;
  public isLoading: boolean = false;
  public showPokemonDetails: boolean = false;

  constructor(
    private pokeapiService: PokeapiService,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.getPokemonList(); // Get pokemon list
    this.searchSub(); // Listen to research
  }

  /**
   * Get pokemon list
   */
  public getPokemonList(): void {
    this.isLoading = true;
    this.pokeapiService
      .getPokemonList()
      .then(value => {
        this.pokemons = value;
        this.filteredPokemons = this.pokemons;
        if (!this.isMobile()) this.selectPokemon(value[0])
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
   * @param {Pokemon | undefined} pokemon Selected pokemon
   */
  public selectPokemon(pokemon: Pokemon | undefined) {
    if (pokemon) {
      // Get pokemon card element
      const card = document.getElementById(this.pokeapiService.getCardId(pokemon)) // Get element by id

      // Added bounce effect
      card?.classList.add('bounce')

      // Check page width
      if (this.isMobile()) {
        // Remove bounce effect after 1 second and update pokemon details
        setTimeout(() => {
          this.selectedPokemon = pokemon;
          this.showPokemonDetails = true;
          card?.classList.remove('bounce');
        }, 1000)
      } else {

        // Select pokemon
        this.selectedPokemon = pokemon;
        this.showPokemonDetails = true;

        // Remove bounce effect after 1 second
        setTimeout(() => card?.classList.remove('bounce'), 1000)
      }

    } else {
      // Hide pokemon details
      this.showPokemonDetails = false;

      // After 500ms show pokemon list
      setTimeout(() => {
        this.selectedPokemon = undefined;
      }, 500)
    }
  }

  /**
   * Check if is mobile
   * @returns {boolean} True if is mobile
   */
  private isMobile(): boolean {
    return this.breakpointObserver.isMatched('(max-width: 950px)');
  }

  /**
   * Update Selected Pokemon
   * @param {number | undefined} pokemonId Pokemon id
   */
  public updateSelectedPokemon(pokemonId: number | undefined): void {
    switch (true) {
      case pokemonId == undefined:
        this.selectPokemon(undefined);
        break;
      case pokemonId! > POKEMON_LIMIT:
        this.selectedPokemon = this.pokemons.find(value => value.id == 1);
        break;
      case pokemonId! == 0:
        this.selectedPokemon = this.pokemons.find(value => value.id == POKEMON_LIMIT);
        break;
      default:
        this.selectedPokemon = this.pokemons.find(value => value.id == pokemonId)
        break;
    }
  }

  /**
   * Change pokemon generation
   * @param {number} genId Generation id
   */
  public onChangeGen(genId: number) {
    this.pokeapiService.setCurrentGeneration(genId);
    this.selectPokemon(undefined);
    this.listOrder = LIST_ORDER_OPTIONS.NORMAL;
    this.getPokemonList()
  }

}
