import { Generation } from "../models";

// Limit
export const POKEMON_LIMIT = 151;

// Storage
export const POKEMON_STORAGE = 'pokemons-list';

// Generations
export const POKEMON_GENERATIONS: Generation[] = [
  { id: 1, offset: 0, limit: 151, name: '1° Generation' },
  { id: 2, offset: 151, limit: 100, name: '2° Generation' },
  { id: 3, offset: 251, limit: 135, name: '3° Generation' },
  { id: 4, offset: 386, limit: 107, name: '4° Generation' },
  { id: 5, offset: 493, limit: 156, name: '5° Generation' },
];
