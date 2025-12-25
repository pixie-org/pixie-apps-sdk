// Image URLs for grocery items using Unsplash
// Using reliable image IDs that are verified to work

const imageMap: Record<string, string> = {
  // Breakfast items
  "Eggs": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop&q=80&auto=format",
  "Bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&q=80&auto=format",
  "Milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop&q=80&auto=format",
  "Butter": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop&q=80&auto=format",
  "Cereal": "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=200&h=200&fit=crop&q=80&auto=format",
  "Orange Juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&h=200&fit=crop&q=80&auto=format",
  
  // Dairy items
  "Cheese": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop&q=80&auto=format",
  "Yogurt": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop&q=80&auto=format",
  "Sour Cream": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop&q=80&auto=format",
  "Cream Cheese": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop&q=80&auto=format",
  
  // Fruits
  "Apples": "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=200&h=200&fit=crop&q=80&auto=format",
  "Bananas": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&q=80&auto=format",
  "Oranges": "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=200&h=200&fit=crop&q=80&auto=format",
  "Strawberries": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop&q=80&auto=format",
  "Grapes": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&h=200&fit=crop&q=80&auto=format",
  "Blueberries": "https://images.unsplash.com/photo-1498557850523-fd3b118b0eda?w=200&h=200&fit=crop&q=80&auto=format",
  
  // Vegetables
  "Carrots": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop&q=80&auto=format",
  "Lettuce": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&h=200&fit=crop&q=80&auto=format",
  "Tomatoes": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=200&h=200&fit=crop&q=80&auto=format",
  "Onions": "https://images.unsplash.com/photo-1618512496249-4f32672f5e4c?w=200&h=200&fit=crop&q=80&auto=format",
  "Broccoli": "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=200&h=200&fit=crop&q=80&auto=format",
  "Spinach": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&q=80&auto=format",
};

export function getImageForItem(name: string): string {
  return imageMap[name] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&q=80&auto=format";
}

