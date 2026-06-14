export type Pagamento = {
  tipo?: string;
  parcelas?: number;
  status?: string;
  valor?: number;
  valorTotal?: number;
  transacaoExternaId?: string | null;
  formaPagamento?: {
    id: number;
    nome: string;
    permiteParcelamento: boolean;
    ativo: boolean;
  };
};

export type PedidoItem = {
  quantidade: number;
  precoUnitario: number;
  nomeProduto: string;
};

export type Pedido = {
  id: number;
  subtotal?: number;
  desconto?: number;
  total?: number;
  codigoCupom?: string | null;
  pagamento?: Pagamento;
  itens?: PedidoItem[];
  dataCriacao?: string;
  status?: string;
};

export type CheckoutPayload = {
  parcelas: number;
  formaPagamento: {
    tipo: string;
  };
  endereco: {
    id: number;
  };
  codigoCupom?: string;
};
