import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Pokemon } from 'src/app/models';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnChanges {
  @Input() pokemon!: Pokemon;
  @Output() updateSelectedPokemon: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

  constructor() { }

  ngOnInit(): void {
    this.setCardColors()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Listening pokemon change
    if (changes['pokemon'].previousValue !== changes['pokemon'].currentValue) {
      this.setCardColors()
    }
  }

  /**
   * Clear selection
   */
  public clearSelection(): void {
    this.updateSelectedPokemon.emit(undefined);
  }

  /**
   * Set primary color
   */
  public setCardColors(): void {
    // Get pokemon colors
    const primary = this.pokemon.colors[0];
    const secondary = this.pokemon.colors[1];

    // Get element style
    const style = document.getElementById('pokemonDetails')!.style // Get element style by id

    // Set CSS variable
    style.setProperty('--primary-color', primary);
    style.setProperty('--secondary-color', secondary ?? primary);
  }

  /**
   * Go to next pokemon
   */
  public next(): void {
    this.updateSelectedPokemon.emit(this.pokemon.id + 1);
  }

  /**
   * Go to previous pokemon
   */
  public previous(): void {
    this.updateSelectedPokemon.emit(this.pokemon.id - 1);
  }

  /**
   * Get css variable that contains the type color
   * @param {string} type Pokemon type
   * @returns {string} type color
   */
  public getPokemonColorByType(type: string): string {
    return `var(--${type}-color)`
  }
}
