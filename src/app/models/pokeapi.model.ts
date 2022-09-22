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
  number: number;
  name: string;
  types: string[];
  weight: number;
  height: number;
  moves: string[];
  img: string;
  description: string;
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


