export interface SmartIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export function parseIngredient(line: string): SmartIngredient {
  const cleanLine = line.trim();
  
  let quantity = 1;
  let remaining = cleanLine;

  const fractionMatch = cleanLine.match(/^(\d+)\s+(\d+)\/(\d+)/); // e.g., "1 1/2"
  const singleFractionMatch = cleanLine.match(/^(\d+)\/(\d+)/); // e.g., "1/2"
  const decimalMatch = cleanLine.match(/^(\d+\.?\d*)/); // e.g., "1.5" or "200"

  if (fractionMatch) {
    const whole = parseInt(fractionMatch[1]);
    const num = parseInt(fractionMatch[2]);
    const den = parseInt(fractionMatch[3]);
    quantity = whole + (num / den);
    remaining = cleanLine.slice(fractionMatch[0].length).trim();
  } else if (singleFractionMatch) {
    const num = parseInt(singleFractionMatch[1]);
    const den = parseInt(singleFractionMatch[2]);
    quantity = num / den;
    remaining = cleanLine.slice(singleFractionMatch[0].length).trim();
  } else if (decimalMatch) {
    quantity = parseFloat(decimalMatch[1]);
    remaining = cleanLine.slice(decimalMatch[1].length).trim();
  }

  // Common units
  const units = ["cups", "cup", "tbsp", "tsp", "g", "grams", "gram", "kg", "ml", "pieces", "piece", "pinch", "pinches", "can", "cans", "tbsp.", "tsp."];
  let unit = "";
  
  const words = remaining.split(/\s+/);
  if (words.length > 0) {
    const firstWord = words[0].toLowerCase().replace(/\./g, "");
    if (units.includes(firstWord) || units.includes(firstWord + "s")) {
      unit = words[0];
      remaining = words.slice(1).join(" ");
    }
  }

  // Clean up name by removing descriptive words
  let name = remaining
    .replace(/\b(washed|chopped|sliced|cubed|organic|fresh|fine|finely|large|small|medium|raw|soft|pureed|boiled|to taste|for garnish|for frying|crumbles|crumbled|powder|cubes|chunks|leaves|seeds|paste)\b/gi, "")
    .replace(/[\(\)\,\-\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Capitalize first letter and keep it clean
  if (name) {
    // S-stripping for simple plurals e.g. "onions" -> "onion"
    let lowerName = name.toLowerCase();
    if (lowerName.endsWith("ies")) {
      lowerName = lowerName.slice(0, -3) + "y";
    } else if (lowerName.endsWith("s") && !lowerName.endsWith("ss") && !lowerName.endsWith("ch") && !lowerName.endsWith("sh")) {
      lowerName = lowerName.slice(0, -1);
    }
    name = lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
  } else {
    name = cleanLine;
  }

  return { name, quantity, unit: unit.toLowerCase() };
}

export function compileSmartShoppingList(ingredientsList: string[]): string[] {
  const grouped: Record<string, { quantity: number; unit: string }> = {};

  ingredientsList.forEach(line => {
    if (!line.trim()) return;
    const parsed = parseIngredient(line);
    const key = `${parsed.name.trim()}__${parsed.unit.trim()}`;

    if (grouped[key]) {
      grouped[key].quantity += parsed.quantity;
    } else {
      grouped[key] = {
        quantity: parsed.quantity,
        unit: parsed.unit,
      };
    }
  });

  return Object.entries(grouped).map(([key, data]) => {
    const [name] = key.split("__");
    const qty = Math.round(data.quantity * 100) / 100;
    
    if (qty === 1 && !data.unit) {
      return name;
    }
    const unitStr = data.unit ? ` ${data.unit}` : "";
    return `${qty}${unitStr} ${name}`;
  });
}
