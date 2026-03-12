export class Produto {
  id!: number;
  sku!: string;
  nome!: string;
  descricao!: string;
  preco!: number;
  quantEstoque!: number;
  imagem!: string;
  ativo!: boolean;
  teorAlcoolico?: number;
  volume?: number;
  paisDeOrigem?: { id: number; nome: string };
  tipoVinho?: { id: number; nome: string };
  marca?: { id: number; nome: string };
  safra?: { id: number; ano: number };
  estilo?: { id: number; nome: string };
  ocasiao?: { id: number; nome: string };
  uvas?: { id: number; nome: string }[];
}
