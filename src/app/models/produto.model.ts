export class Produto {
  id!: number;
  nome!: string;
  descricao!: string;
  preco!: number;
  estoque!: { quantidade: number };
  ativo!: boolean;
}
