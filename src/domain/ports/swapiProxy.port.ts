export interface SwapiPeople {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: unknown[];
  vehicles: string[];
  starships: string[];
  created: Date;
  edited: Date;
  url: string;
}

export interface SwapiNormalize {
  nombre: string;
  altura: string;
  masa: string;
  colorPelo: string;
  colorPiel: string;
  colorOjo: string;
  aniversario: string;
  genero: string;
  fechaFundado: string;
}

export interface SwapiProxyPort {
  getPeople(): Promise<SwapiPeople[]>;
}
