// ============================================
// PRODUCTOS INICIALES - Tierra Argentina
// Solo con los datos que el cliente proporcionó
// ============================================

export interface InitialProduct {
  name: string
  price: number
  sizes: string[]
  pdfPages?: string
  notes?: string
  colors?: string[]
}

export const initialProducts: InitialProduct[] = [
  // BOMBACHAS
  {
    name: "Bombacha gabardina elastizada dama",
    price: 35000,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
    pdfPages: "2-29"
  },
  {
    name: "Bombacha de jean elastizado dama",
    price: 35000,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
    pdfPages: "30-33"
  },
  {
    name: "Bombacha mil rayas dama",
    price: 35000,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
    pdfPages: "34-40"
  },
  {
    name: "Bombacha de lino dama",
    price: 35000,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
    notes: "Por ahora sin fotos, se cargarán después"
  },
  {
    name: "Bombacha de gabardina elastizada caballero",
    price: 30000,
    sizes: ["38", "40", "42", "44", "46", "48", "50", "52", "54"],
    pdfPages: "48-56"
  },
  {
    name: "Bombacha gabardina niño",
    price: 22000,
    sizes: ["00", "0", "1", "2", "4", "6", "8", "10", "12", "14", "16"],
    pdfPages: "65-72"
  },
  {
    name: "Bombacha gabardina niña",
    price: 22000,
    sizes: ["00", "0", "1", "2", "4", "6", "8", "10", "12", "14", "16"],
    pdfPages: "73-85"
  },

  // CHALECOS
  {
    name: "Chaleco matelasse dama",
    price: 35000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    pdfPages: "57-60"
  },
  {
    name: "Chaleco matelasse caballero",
    price: 35000,
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    pdfPages: "61-65"
  },

  // CHOMBAS
  {
    name: "Chomba pique dama",
    price: 0,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Azul", "Negro", "Blanco", "Beige", "Bordo"],
    pdfPages: "94-100"
  },

  // ACCESORIOS
  {
    name: "Pañuelo estampado",
    price: 7500,
    sizes: ["Único"],
    notes: "Varios modelos disponibles",
    pdfPages: "86-93"
  },
  {
    name: "Corbatin",
    price: 5000,
    sizes: ["Único"],
    notes: "Varios colores disponibles",
    pdfPages: "101-102"
  },
  {
    name: "Boina de hilo",
    price: 8900,
    sizes: ["32cm", "26cm"],
    notes: "Varios colores disponibles",
    pdfPages: "106-109"
  }
]

// ============================================
// FUNCIÓN: Extraer categoría del nombre
// ============================================
export function extractCategoryFromName(name: string): string {
  const firstWord = name.split(' ')[0].toLowerCase()
  
  if (firstWord.endsWith('a') || firstWord.endsWith('e') || firstWord.endsWith('o')) {
    return firstWord + 's'
  }
  return firstWord + 'es'
}

// ============================================
// FUNCIÓN: Extraer tipo del nombre
// ============================================
export function extractTypeFromName(name: string): string | null {
  const nameLower = name.toLowerCase()
  
  if (nameLower.includes('dama')) return 'Dama'
  if (nameLower.includes('caballero')) return 'Caballero'
  if (nameLower.includes('niño')) return 'Niño'
  if (nameLower.includes('niña')) return 'Niña'
  
  return null
}

// ============================================
// FUNCIÓN: Mapear categoría extraída a oficial
// ============================================
export function mapToOfficialCategory(extractedCategory: string): string {
  const mapping: Record<string, string> = {
    'bombachas': 'Bombachas',
    'chalecos': 'Chalecos',
    'chombas': 'Chombas',
    'pañuelos': 'Accesorios',
    'corbatins': 'Accesorios',
    'corbatines': 'Accesorios',
    'boinas': 'Accesorios'
  }
  
  return mapping[extractedCategory] || 'Accesorios'
}