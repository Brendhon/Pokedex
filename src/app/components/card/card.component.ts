import { Input } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Pokemon } from 'src/app/models';
import { PokeapiService } from 'src/app/services/pokeapi/pokeapi.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit, AfterViewInit {
  @Input() pokemon!: Pokemon;
  constructor(
    private pokeapiService: PokeapiService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.setCardColors();
  }

  /**
   * Get card id
   * @returns {string} Card id
   */
  public getCardId(): string {
    return this.pokeapiService.getCardId(this.pokemon);
  }

  /**
   * Set primary color
   */
  public setCardColors(): void {
    // Get pokemon colors
    const primary = this.pokemon.colors[0];
    const secondary = this.pokemon.colors[1];

    // Get element style
    const style = document.getElementById(this.getCardId())!.style // Get element style by id

    // Set CSS variable
    style.setProperty('--primary-color', primary);
    style.setProperty('--secondary-color', secondary ?? primary);
  }

  /**
   * Get img url
   * @param {Blob} img Blob
   * @returns {SafeResourceUrl} Safe Resource Url
   */
  public getImgUrl(img: Blob): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(img))
  }
}
