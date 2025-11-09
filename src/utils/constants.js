// Vertical-specific data and constants
const VERTICAL_BENCHMARKS = {
  healthcare: {
    avgCompliance: 74,
    averageRevenue: 150000000, // $150M average annual revenue
    sites: [
      { url: 'https://www.nih.gov', title: 'National Institutes of Health', monthlyVisits: 202000000 },
      { url: 'https://www.mayoclinic.org', title: 'Mayo Clinic', monthlyVisits: 95000000 },
      { url: 'https://www.webmd.com', title: 'WebMD', monthlyVisits: 85000000 },
      { url: 'https://www.healthline.com', title: 'Healthline', monthlyVisits: 72000000 },
      { url: 'https://www.cdc.gov', title: 'CDC', monthlyVisits: 68000000 }
    ],
    mandate: 'HHS requires WCAG 2.1 AA by May 2026'
  },
  fintech: {
    avgCompliance: 31,
    averageRevenue: 250000000, // $250M average annual revenue
    sites: [
      { url: 'https://stripe.com', title: 'Stripe', monthlyVisits: 45000000 },
      { url: 'https://www.paypal.com', title: 'PayPal', monthlyVisits: 380000000 },
      { url: 'https://www.coinbase.com', title: 'Coinbase', monthlyVisits: 62000000 },
      { url: 'https://robinhood.com', title: 'Robinhood', monthlyVisits: 28000000 },
      { url: 'https://www.klarna.com', title: 'Klarna', monthlyVisits: 35000000 }
    ],
    mandate: 'EAA (European Accessibility Act) - June 28, 2025'
  },
  ecommerce: {
    avgCompliance: 55,
    averageRevenue: 500000000,
    sites: [
      { url: 'https://www.amazon.com', title: 'Amazon', monthlyVisits: 2500000000 },
      { url: 'https://www.ebay.com', title: 'eBay', monthlyVisits: 850000000 },
      { url: 'https://www.shopify.com', title: 'Shopify', monthlyVisits: 110000000 },
      { url: 'https://www.etsy.com', title: 'Etsy', monthlyVisits: 450000000 },
      { url: 'https://www.walmart.com', title: 'Walmart', monthlyVisits: 420000000 }
    ],
    mandate: 'ADA Title III compliance required'
  },
  education: {
    avgCompliance: 68,
    averageRevenue: 100000000,
    sites: [
      { url: 'https://www.harvard.edu', title: 'Harvard University', monthlyVisits: 25000000 },
      { url: 'https://www.mit.edu', title: 'MIT', monthlyVisits: 22000000 },
      { url: 'https://www.stanford.edu', title: 'Stanford University', monthlyVisits: 20000000 },
      { url: 'https://www.coursera.org', title: 'Coursera', monthlyVisits: 85000000 },
      { url: 'https://www.khanacademy.org', title: 'Khan Academy', monthlyVisits: 45000000 }
    ],
    mandate: 'Section 508 compliance required for federal funding'
  },
  gaming: {
    avgCompliance: 42,
    averageRevenue: 350000000,
    sites: [
      { url: 'https://store.steampowered.com', title: 'Steam', monthlyVisits: 520000000 },
      { url: 'https://www.epicgames.com', title: 'Epic Games Store', monthlyVisits: 95000000 },
      { url: 'https://www.ign.com', title: 'IGN', monthlyVisits: 180000000 },
      { url: 'https://www.twitch.tv', title: 'Twitch', monthlyVisits: 1800000000 },
      { url: 'https://www.roblox.com', title: 'Roblox', monthlyVisits: 420000000 },
      { url: 'https://www.nintendo.com', title: 'Nintendo', monthlyVisits: 75000000 },
      { url: 'https://www.ea.com', title: 'EA Games', monthlyVisits: 65000000 },
      { url: 'https://www.playstation.com', title: 'PlayStation', monthlyVisits: 125000000 }
    ],
    mandate: 'ADA Title III compliance, CVAA for communications features'
  }
};

const WCAG_LEVELS = {
  A: 'Level A (Minimum)',
  AA: 'Level AA (Mid-range)',
  AAA: 'Level AAA (Highest)'
};

const VIOLATION_SEVERITY = {
  CRITICAL: 'critical',
  SERIOUS: 'serious',
  MODERATE: 'moderate',
  MINOR: 'minor'
};

module.exports = {
  VERTICAL_BENCHMARKS,
  WCAG_LEVELS,
  VIOLATION_SEVERITY
};
