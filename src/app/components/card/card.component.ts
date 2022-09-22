import { Input } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Pokemon } from 'src/app/models';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit, AfterViewInit {
  @Input() pokemon!: Pokemon;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.setPrimaryColor();
  }

  /**
   * Get card id
   * @returns {string} Card id
   */
  public getCardId(): string {
    return 'card-' + this.pokemon.name;
  }

  /**
   * Format Pokemon Number
   * @returns {string} Pokemon number
   */
  public formatPokemonNumber(): string {
    const number = `${this.pokemon.number}`;
    switch (number.length) {
      case 1:
        return `#00${number}`;
      case 2:
        return `#0${number}`;
      default:
        return `#${number}`;
    }
  }

  /**
   * Set primary color
   */
  public setPrimaryColor(): void {
    // Get pokemon colors
    const primary = this.pokemon.colors[0];
    const secondary = this.pokemon.colors[1];

    // Get element style
    const style = document.getElementById(this.getCardId())!.style // Get element style by id

    // Set CSS variable
    style.setProperty('--primary-color', primary);
    style.setProperty('--secondary-color', secondary ?? primary);

  }

}
