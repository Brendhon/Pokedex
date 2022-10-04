import { Generation } from "../models";

// Limit
export const POKEMON_LIMIT = 386;

// Pokemon DB
export const POKEMON_DB = 'pokemonDB';

// Pokemon Table
export const POKEMON_TABLE = 'pokemon';

// Storage
export const POKEMON_STORAGE = 'pokemonsList';

// Generations
export const POKEMON_GENERATIONS: Generation[] = [
  { id: 0, offset: 0, limit: POKEMON_LIMIT, until: POKEMON_LIMIT, name: 'Generation', selected: false },
  { id: 1, offset: 0, limit: 151, until: 151, name: '1° Generation', selected: true },
  { id: 2, offset: 151, limit: 100, until: 251, name: '2° Generation', selected: false },
  { id: 3, offset: 251, limit: 135, until: 386, name: '3° Generation', selected: false },
];
