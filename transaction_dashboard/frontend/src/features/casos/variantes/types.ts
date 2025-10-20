// frontend/src/features/casos/variantes/types.ts

export interface VariantMetrics {
  totalProductos: string;
  productosConVariantes: string;
  promedioVariantesPorProducto: string;
  tipoVarianteMasComun: string;
  porcentajeProductosConVariantes: string;
}

export interface VariantDetection {
  productId: number;
  productName: string;
  categoria: string;
  baseName: string;
  variantType: string;
  variantValue: string;
  totalVendido: string;
  numTransacciones: string;
}

export interface VariantGroup {
  baseName: string;
  categoria: string;
  totalVariantes: number;
  variantes: string;
  totalVentas: string;
  productoMasVendido: string;
  varianteMasVendida: string;
}

export interface CategoryAnalysis {
  categoria: string;
  productosConVariantes: number;
  totalVariantes: number;
  promedioVariantes: number;
}

export interface PriceVariation {
  baseName: string;
  variantValue: string;
  precioPromedio: string;
  variacionPrecio: string;
}

export interface VariantAnalysisData {
  metrics: VariantMetrics;
  topVariantGroups: VariantGroup[];
  categoryAnalysis: CategoryAnalysis[];
  priceVariations: PriceVariation[];
}