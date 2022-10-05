import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DEFAULT_GENERATION, POKEMON_GENERATIONS } from './constants/pokemon';
import { LIST_ORDER_OPTIONS } from './models/pokemon.enum';
import { Pokemon } from './models/pokemon.model';
import { trigger, transition, animate, style } from '@angular/animations'
import { BreakpointObserver } from '@angular/cdk/layout';
import { DbService } from './services/db/db.service';
import { PokemonService } from './services/pokemon/pokemon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('300ms', style({ transform: 'translateX(100%)', opacity: 0 }))
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
  public defaultGen = DEFAULT_GENERATION;
  public selectedPokemon: Pokemon | undefined;
  public isLoading: boolean = false;
  public showPokemonDetails: boolean = false;

  constructor(
    private pokemonService: PokemonService,
    private breakpointObserver: BreakpointObserver,
    private db: DbService,
  ) { }

  ngOnInit(): void {
    this.getPokemonList(); // Get pokemon list
    this.searchSub(); // Listen to research
  }

  /**
   * Get pokemon list
   */
  public async getPokemonList(): Promise<void> {
    // Remove filtered pokemons
    this.filteredPokemons = [];

    // Get current generation
    const genId = this.pokemonService.getCurrentGeneration().id;

    // Check if data already exist
    if (!await this.db.hasPokemonList(genId)) {
      this.isLoading = true; // Show loading
      this.pokemonService.fetchPokemonList(genId); // Make request to get the data if they do not exist
    }

    // Subscribe to listening change of
    const sub = this.db.getPokemonByGeneration(genId).subscribe(value => {
      if (value.length > 0) {
        this.isLoading = false;
        sub.unsubscribe();
        this.setPokemonList(value)
      }
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
    // Move scroll to top
    const listElement = document.getElementById('cardList');
    if (listElement) listElement.scrollTop = 0;
  }

  /**
   * Select a pokemon
   * @param {Pokemon | undefined} pokemon Selected pokemon
   */
  public selectPokemon(pokemon: Pokemon | undefined) {
    // Select pokemon
    if (pokemon) {
      this.selectedPokemon = pokemon;
      this.showPokemonDetails = true;
    } else {
      this.showPokemonDetails = false; // Hide pokemon details
      setTimeout(() => {
        const lastVisitPokemon = this.selectedPokemon;
        this.selectedPokemon = undefined
        this.scrollToPokemon(lastVisitPokemon!);
      }, 500) // After 400ms show pokemon list
    }
  }

  /**
   * Check if is mobile
   * @returns {boolean} True if is mobile
   */
  private isMobileView(): boolean {
    return this.breakpointObserver.isMatched('(max-width: 900px)');
  }

  /**
   * Update Selected Pokemon
   * @param {number | undefined} pokemonId Pokemon id
   */
  public updateSelectedPokemon(pokemonId: 'next' | 'previous' | undefined): void {
    // Init flag
    let pokemonPosition = 0;

    switch (true) {
      // Clear selected pokemon
      case pokemonId == undefined:
        this.selectPokemon(undefined);
        break;
      // Go to previous pokemon
      case pokemonId == 'previous':
        pokemonPosition = this.filteredPokemons.findIndex(pokemon => pokemon.id == this.selectedPokemon!.id);
        this.selectedPokemon = this.filteredPokemons[pokemonPosition - 1];
        break;
      // Go to next pokemon
      case pokemonId == 'next':
        pokemonPosition = this.filteredPokemons.findIndex(pokemon => pokemon.id == this.selectedPokemon!.id);
        this.selectedPokemon = this.filteredPokemons[pokemonPosition + 1];
        break;
    }
  }

  /**
   * Check if can show Right Arrow
   * @returns {boolean} True if can show Right Arrow
   */
  public showRightArrow(): boolean {
    if (!this.selectedPokemon) return false;
    const pokemonPosition = this.filteredPokemons.findIndex(value => value.id == this.selectedPokemon!.id);
    return pokemonPosition !== this.filteredPokemons.length - 1;
  }

  /**
   * Check if can show Left Arrow
   * @returns {boolean} True if can show Left Arrow
   */
  public showLeftArrow(): boolean {
    if (!this.selectedPokemon) return false;
    const pokemonPosition = this.filteredPokemons.findIndex(value => value.id == this.selectedPokemon!.id);
    return pokemonPosition !== 0;
  }

  /**
   * Change pokemon generation
   * @param {number} genId Generation id
   */
  public async onChangeGen(genId: number) {
    // Set current generation
    this.pokemonService.setCurrentGeneration(genId);

    // Set list order
    this.listOrder = LIST_ORDER_OPTIONS.NORMAL;

    // Get pokemon list
    this.getPokemonList();
  }

  /**
   * Set Pokemon List
   * @param {Pokemon[]} pokemons Pokemons
   */
  private setPokemonList(pokemons: Pokemon[]): void {
    // Set local atributes
    this.pokemons = pokemons;
    this.filteredPokemons = this.pokemons;

    // Check if is a mobile view or not
    if (!this.isMobileView())
      this.selectPokemon(pokemons[0]); // Select first pokemon
  }

  /**
   * Scroll to pokemon
   * @param {Pokemon} pokemon Pokemon
   */
  public scrollToPokemon(pokemon: Pokemon): void {
    // Get card id
    const cardId = this.pokemonService.getCardId(pokemon);

    // Go to pokemon
    setTimeout(() => {
      const listElement = document.getElementById('cardList');
      const cardElement = document.getElementById(cardId);

      // Set scroll position
      if (listElement && cardElement)
        listElement.scrollTop = cardElement.offsetTop - cardElement.offsetHeight - 20;
    })
  }
}
