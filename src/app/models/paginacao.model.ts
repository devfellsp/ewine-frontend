export type ConsultaPaginada = {
  page: number;
  size: number;
};

export type Pagina<T> = {
  itens: T[];
  total: number;
  page: number;
  size: number;
};

export type PaginaResponse<T> = {
  content?: T[];
  items?: T[];
  data?: T[];
  results?: T[];
  totalElements?: number;
  total?: number;
  page?: number;
  number?: number;
  size?: number;
};

export function normalizarPagina<T>(response: T[] | PaginaResponse<T> | null, page: number, size: number): Pagina<T> {
  if (Array.isArray(response)) {
    return {
      itens: response,
      total: response.length,
      page,
      size,
    };
  }

  const itens = response?.content ?? response?.items ?? response?.data ?? response?.results ?? [];

  return {
    itens,
    total: response?.totalElements ?? response?.total ?? itens.length,
    page: response?.page ?? response?.number ?? page,
    size: response?.size ?? size,
  };
}
