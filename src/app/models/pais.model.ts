export type Pais = {
  id: number;
  nome: string;
  sigla: string;
};

export type PaisFormValue = Omit<Pais, 'id'>;
