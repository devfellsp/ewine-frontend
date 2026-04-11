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
};

export type Cliente = {
  cpf: string;
  email: string;
  usuario: UsuarioCliente;
  endereco: EnderecoCliente[];
};
