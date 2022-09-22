import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Pokemon } from 'src/app/models';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() pokemon!: Pokemon;

  constructor() { }

  ngOnInit(): void {
  }

}
