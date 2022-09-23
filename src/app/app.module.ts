import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CardComponent } from './components/card/card.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './components/details/details.component';
import { PokemonWeightPipe } from './pipes/pokemon-weight/pokemon-weight.pipe';
import { PokemonHeightPipe } from './pipes/pokemon-height/pokemon-height.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    DetailsComponent,
    PokemonWeightPipe,
    PokemonHeightPipe,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
