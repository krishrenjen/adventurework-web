export interface Product {
  productId: number;
  name: string;
  productNumber: string;
  listPrice: number;
  standardCost: number;
  size: string;
  sizeUnitMeasureCode: string;
  weight: number;
  weightUnitMeasureCode: string;
  sellStartDate: string; // ISO 8601 date string
  category: string;
  subcategory: string;
  description?: string;
}

export interface ProductShort{
  productId: number;
  name: string;
  productNumber: string;
  listPrice: number;
}