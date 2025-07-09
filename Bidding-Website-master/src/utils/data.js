// Categories for antique products
export const categories = [
  "Furniture",
  "Jewelry",
  "Ceramics & Porcelain",
  "Art & Paintings",
  "Coins & Currency",
  "Books & Manuscripts",
  "Textiles & Clothing",
  "Glassware",
  "Silverware & Metalwork",
  "Clocks & Watches",
  "Musical Instruments",
  "Toys & Games",
  "Military Collectibles",
  "Religious Artifacts",
  "Decorative Arts"
];

export const processList = [
  {
    id: "01",
    title: "Register & Verify",
    desc: "Create your account and verify your identity. Upload photos of your authentic antique items with proper documentation and certificates of authenticity.",
    cover: "https://rainbowthemes.net/themes/nuron/wp-content/uploads/2023/01/shape-7.png",
  },
  {
    id: "02",
    title: "List Your Antique",
    desc: "Create detailed listings with high-quality photos, historical information, and provenance details. Our experts review each submission for authenticity.",
    cover: "https://rainbowthemes.net/themes/nuron/wp-content/uploads/2023/09/auction.png",
  },
  {
    id: "03",
    title: "Auction Goes Live",
    desc: "Your antique goes live for bidding. Ethiopian collectors can place bids during the auction period. Track bids in real-time with our live auction system.",
    cover: "https://rainbowthemes.net/themes/nuron/wp-content/uploads/2023/09/auction-2.png",
  },
  {
    id: "04",
    title: "Secure Transaction",
    desc: "When the auction ends, we facilitate secure payment and shipping. Both buyers and sellers are protected throughout the entire transaction process.",
    cover: "https://rainbowthemes.net/themes/nuron/wp-content/uploads/2023/09/auction-3.png",
  },
];

// Navigation menu data - using relative paths for proper client-side routing
export const menulists = [
  { id: 1, name: "Home", path: "/" },
  { id: 2, name: "Browse Auctions", path: "/" }, // Updated to point to home page which shows auctions
  { id: 3, name: "About", path: "/about" },
  { id: 4, name: "Contact", path: "/contact" }
];

// Role-based menu function
export const getRoleBasedMenus = (role) => {
  const baseMenus = [...menulists];

  if (role === "admin") {
    return [
      ...baseMenus,
      { id: 5, name: "Dashboard", path: "/dashboard" },
      { id: 6, name: "Create Listing", path: "/add-product" },
      { id: 7, name: "Admin Panel", path: "/admin/dashboard" }
    ];
  }

  if (role === "user") {
    return [
      ...baseMenus,
      { id: 5, name: "Dashboard", path: "/dashboard" },
      { id: 6, name: "Create Listing", path: "/add-product" },
      { id: 7, name: "My Bids", path: "/my-bids" }
    ];
  }

  return baseMenus;
};

// Additional exports for compatibility with existing components
export const trustList = [];
