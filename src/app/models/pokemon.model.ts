export interface SearchResult {
  count: number;
  next: string;
  previous: string;
  results: Results[];
}

export interface Results {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  number: string;
  name: string;
  types: string[];
  weight: number;
  height: number;
  moves: string[];
  img: Blob;
  description: string,
  isLegendary: boolean,
  isBaby: boolean,
  isMythical: boolean,
  isFavorite: boolean;
  gen: number;
  status: Status;
  colors: string[];
}

export interface Status {
  hp: number;
  atk: number;
  def: number;
  satk: number;
  sdef: number;
  spd: number;
}

export interface Generation {
  id: number,
  offset: number,
  limit: number,
  until: number,
  name: string,
}

export interface PokemonSpecies {
  description: string,
  isLegendary: boolean,
  isBaby: boolean,
  isMythical: boolean
}


