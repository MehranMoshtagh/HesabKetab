export interface Category {
  id: string;
  nameKey: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  nameKey: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: "entertainment",
    nameKey: "categories.entertainment",
    icon: "🎭",
    color: "#7c3aed",
    subcategories: [
      { id: "games", nameKey: "categories.games", icon: "🎮" },
      { id: "movies", nameKey: "categories.movies", icon: "🎬" },
      { id: "music", nameKey: "categories.music", icon: "🎵" },
      { id: "sports", nameKey: "categories.sports", icon: "⚽" },
      { id: "other-entertainment", nameKey: "categories.otherEntertainment", icon: "🎭" },
    ],
  },
  {
    id: "food-and-drink",
    nameKey: "categories.foodAndDrink",
    icon: "🍽️",
    color: "#ea580c",
    subcategories: [
      { id: "groceries", nameKey: "categories.groceries", icon: "🛒" },
      { id: "dining-out", nameKey: "categories.diningOut", icon: "🍽️" },
      { id: "liquor", nameKey: "categories.liquor", icon: "🍷" },
      { id: "other-food", nameKey: "categories.otherFood", icon: "🍔" },
    ],
  },
  {
    id: "home",
    nameKey: "categories.home",
    icon: "🏠",
    color: "#0284c7",
    subcategories: [
      { id: "rent", nameKey: "categories.rent", icon: "🏠" },
      { id: "mortgage", nameKey: "categories.mortgage", icon: "🏦" },
      { id: "household-supplies", nameKey: "categories.householdSupplies", icon: "🧹" },
      { id: "furniture", nameKey: "categories.furniture", icon: "🪑" },
      { id: "maintenance", nameKey: "categories.maintenance", icon: "🔧" },
      { id: "pets", nameKey: "categories.pets", icon: "🐾" },
      { id: "services", nameKey: "categories.services", icon: "🛠️" },
      { id: "electronics", nameKey: "categories.electronics", icon: "📱" },
      { id: "home-insurance", nameKey: "categories.insurance", icon: "🛡️" },
      { id: "other-home", nameKey: "categories.otherHome", icon: "🏠" },
    ],
  },
  {
    id: "life",
    nameKey: "categories.life",
    icon: "🧬",
    color: "#059669",
    subcategories: [
      { id: "childcare", nameKey: "categories.childcare", icon: "👶" },
      { id: "clothing", nameKey: "categories.clothing", icon: "👕" },
      { id: "education", nameKey: "categories.education", icon: "📚" },
      { id: "gifts", nameKey: "categories.gifts", icon: "🎁" },
      { id: "medical-expenses", nameKey: "categories.medicalExpenses", icon: "🏥" },
      { id: "taxes", nameKey: "categories.taxes", icon: "📋" },
      { id: "life-insurance", nameKey: "categories.lifeInsurance", icon: "🛡️" },
      { id: "other-life", nameKey: "categories.otherLife", icon: "🧬" },
    ],
  },
  {
    id: "transportation",
    nameKey: "categories.transportation",
    icon: "🚗",
    color: "#dc2626",
    subcategories: [
      { id: "parking", nameKey: "categories.parking", icon: "🅿️" },
      { id: "gas-fuel", nameKey: "categories.gasFuel", icon: "⛽" },
      { id: "bus-train", nameKey: "categories.busTrain", icon: "🚌" },
      { id: "taxi-ride-share", nameKey: "categories.taxiRideShare", icon: "🚕" },
      { id: "plane", nameKey: "categories.plane", icon: "✈️" },
      { id: "hotel", nameKey: "categories.hotel", icon: "🏨" },
      { id: "car-rental", nameKey: "categories.carRental", icon: "🚙" },
      { id: "bicycle", nameKey: "categories.bicycle", icon: "🚲" },
      { id: "other-transportation", nameKey: "categories.otherTransportation", icon: "🚗" },
    ],
  },
  {
    id: "utilities",
    nameKey: "categories.utilities",
    icon: "💡",
    color: "#ca8a04",
    subcategories: [
      { id: "electricity", nameKey: "categories.electricity", icon: "⚡" },
      { id: "heat-gas", nameKey: "categories.heatGas", icon: "🔥" },
      { id: "water", nameKey: "categories.water", icon: "💧" },
      { id: "tv-phone-internet", nameKey: "categories.tvPhoneInternet", icon: "📡" },
      { id: "trash", nameKey: "categories.trash", icon: "🗑️" },
      { id: "cleaning", nameKey: "categories.cleaning", icon: "🧽" },
      { id: "other-utilities", nameKey: "categories.otherUtilities", icon: "💡" },
    ],
  },
  {
    id: "uncategorized",
    nameKey: "categories.uncategorized",
    icon: "📄",
    color: "#6b7280",
    subcategories: [
      { id: "general", nameKey: "categories.general", icon: "📄" },
    ],
  },
];

/** Find a subcategory by ID across all categories */
export function findSubcategory(subcategoryId: string) {
  for (const cat of categories) {
    const sub = cat.subcategories.find((s) => s.id === subcategoryId);
    if (sub) return { parent: cat, subcategory: sub };
  }
  return null;
}

/** Get all subcategories as a flat list */
export function getAllSubcategories() {
  return categories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      ...sub,
      parentId: cat.id,
      parentNameKey: cat.nameKey,
      color: cat.color,
    }))
  );
}
