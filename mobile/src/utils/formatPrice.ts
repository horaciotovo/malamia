/**
 * Formatea un número como precio en formato argentino.
 * Ej: 8500 → "$8.000"  |  12500 → "$12.500"
 */
export function formatPrice(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-AR');
}
