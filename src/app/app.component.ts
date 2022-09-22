import { Component, OnInit } from '@angular/core';
import { Pokemon } from './models/pokeapi.model';
import { PokeapiService } from './services/pokeapi/pokeapi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Pokedex';

  constructor(private pokeapiService: PokeapiService) { }

  public pokemons: Pokemon[] = [];

  async ngOnInit(): Promise<void> {
    this.pokemons = await this.pokeapiService.getPokemonList() // Get pokemon list
    console.log(this.pokemons)
  }
}
