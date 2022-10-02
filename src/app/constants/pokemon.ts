import { Generation } from "../models";

// Limit
export const POKEMON_LIMIT = 649;

// Storage
export const POKEMON_STORAGE = 'pokemonsList';

// Generations
export const POKEMON_GENERATIONS: Generation[] = [
  { id: 0, offset: 0, limit: POKEMON_LIMIT, until: POKEMON_LIMIT, name: 'All Generations' },
  { id: 1, offset: 0, limit: 151, until: 151, name: '1° Generation' },
  { id: 2, offset: 151, limit: 100, until: 251, name: '2° Generation' },
  { id: 3, offset: 251, limit: 135, until: 386, name: '3° Generation' },
  { id: 4, offset: 386, limit: 107, until: 493, name: '4° Generation' },
  { id: 5, offset: 493, limit: 156, until: 649, name: '5° Generation' },
];
