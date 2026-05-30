// Simple dictionary-based heuristic categorization
const KEYWORD_MAP = {
  'uber': 'Transporte',
  'cabify': 'Transporte',
  'gasolina': 'Transporte',
  'mcdonalds': 'Comida',
  'burger king': 'Comida',
  'rappi': 'Comida',
  'pedidosya': 'Comida',
  'supermercado': 'Hogar',
  'mercadona': 'Hogar',
  'luz': 'Servicios',
  'agua': 'Servicios',
  'internet': 'Servicios',
  'netflix': 'Entretenimiento',
  'spotify': 'Entretenimiento',
  'steam': 'Entretenimiento',
  'cine': 'Entretenimiento',
  'sueldo': 'Ingresos',
  'salario': 'Ingresos',
  'nómina': 'Ingresos'
};

export const suggestCategory = (description, existingCategories) => {
  if (!description) return null;
  
  const descLower = description.toLowerCase();
  
  // 1. Check keyword mapping
  for (const [keyword, categoryName] of Object.entries(KEYWORD_MAP)) {
    if (descLower.includes(keyword)) {
      const match = existingCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (match) return match.id;
    }
  }

  // 2. Check direct category name matching in description
  for (const cat of existingCategories) {
    if (descLower.includes(cat.name.toLowerCase())) {
      return cat.id;
    }
  }

  return null;
};
