
export enum View {
  DASHBOARD = 'DASHBOARD',
  VENDORS = 'VENDORS',
  PRODUCTS = 'PRODUCTS',
  DISTRIBUTION = 'DISTRIBUTION',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  status: 'Ativo' | 'Inativo' | 'Férias' | 'Atenção' | 'Alto Estoque';
  avatar: string;
  stockCount?: number;
  stockValue?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image: string;
  status?: 'Em Estoque' | 'Baixo Estoque' | 'Indisponível';
}

export interface CartItem extends Product {
  quantity: number;
}
