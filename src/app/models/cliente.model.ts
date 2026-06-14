export type UsuarioCliente = {
  id: number;
  nome: string;
  login: string;
  perfil: string;
};

export type EnderecoCliente = {
  id: number;
  cep: string;
  numero: number;
  complemento: string | null;
  logradouro: string;
  cidade: string;
  bairro?: string | null;
  estado?: string | null;
  uf?: string | null;
};

export type CidadeCliente = {
  id: number;
  nome: string;
  idEstado: number;
};

export type NovoEnderecoCliente = {
  cep: string;
  numero: number;
  complemento: string;
  logradouro: string;
  cidade: {
    id: number;
  };
};

export type Cliente = {
  cpf: string;
  email: string;
  telefone?: string | null;
  usuario: UsuarioCliente;
  endereco: EnderecoCliente[];
};
