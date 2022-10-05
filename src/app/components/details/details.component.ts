import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import { Pokemon } from 'src/app/models';
import { PokemonService } from 'src/app/services/pokemon/pokemon.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnChanges {
  @Input() pokemon!: Pokemon;
  @Input() disableDownload = false;
  @Output() updateSelectedPokemon: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

  // Local attr
  public statusOptions = ["hp", "atk", "def", "satk", "sdef", "spd"];

  constructor(private pokemonService: PokemonService) { }

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

  /**
   * Get Pokemon Status By Key
   * @param {string} key Status key
   * @returns {string} Pokemon status value
   */
  public getPokemonStatusByKey(key: string): string {
    const status = this.pokemon.status as any;
    const statusValue = `${status[key]}`;

    switch (statusValue.length) {
      case 1:
        return `00${statusValue}`;
      case 2:
        return `0${statusValue}`;
      default:
        return `${statusValue}`;
    }
  }

  /**
   * Get bar width
   * @param {string} type Status Type
   * @returns {string} Width
   */
  public getStatusBarWidth(type: string): string {
    const value = +this.getPokemonStatusByKey(type);
    return `${Math.ceil((value * 100) / 200)}%`;
  }

  /**
   * Check if can show Right Arrow
   * @returns {boolean} True if can show Right Arrow
   */
  public showRightArrow(): boolean {
    // Get current generation info
    const gen = this.pokemonService.getCurrentGeneration();
    return this.pokemon.id < gen.offset + gen.limit;
  }

  /**
   * Check if can show Left Arrow
   * @returns {boolean} True if can show Left Arrow
   */
  public showLeftArrow(): boolean {
    // Get current generation info
    const gen = this.pokemonService.getCurrentGeneration();
    return this.pokemon.id > gen.offset + 1;
  }

  /**
   * Download Pokemon Card
   */
  public async downloadPokemonCard(): Promise<void> {
    // Disable download option
    this.disableDownload = true;

    // Get card element
    const element = document.getElementById("pokemonDetails")!;

    // Get canvas from element
    const canvas = await html2canvas(element)

    // Enable download option
    this.disableDownload = false;

    // Convert the canvas to blob
    canvas.toBlob(async (blob) => {
      // Get pokemon name
      const pokemonName = this.pokemon.name[0].toUpperCase() + this.pokemon.name.substring(1);

      // Get file name
      const fileName = `${pokemonName}.png`;

      // Get file
      const files = [new File([blob!], fileName, { type: blob!.type })]

      // Form share data
      const shareData = {
        text: `It's so beautiful 😍`,
        title: pokemonName,
        files,
      }

      // Try share if fail download img
      try {
        // Shared data
        await navigator.share(shareData)
      } catch (err) {
        // To download directly on browser default 'downloads' location
        const link = document.createElement("a");
        link.download = fileName;
        link.href = URL.createObjectURL(blob!);
        link.click();
      }
    }, 'image/png');
  }
}
