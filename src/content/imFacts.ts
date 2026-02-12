/**
 * All facts must be traceable to the Dec 2025 Information Memorandum.
 * Do not modify numbers without updating IM source.
 * 
 * Source: Futura Energy Information Memorandum, December 2025
 */

export const companyOverview = {
  description: "Futura is a group of companies primarily active in trading crude oil and refined products.",
  incorporationYear: 2022,
  headquarters: "Dubai",
  ceo: {
    name: "Matej Jovanovic",
    qualifications: "MA, University of Cambridge",
  },
  operationalTeams: ["Serbia", "Turkey", "Switzerland"],
  dedicatedTradingOffice: "Dubai",
  employeeCount: "20+ professional employees",
  relationships: {
    description: "Working with most major Mediterranean and Black Sea refineries and well-known trading companies.",
    partners: "110+ reliable partners across 5 regions",
    regions: 5,
  },
  focus: "Emphasis on risk analysis and compliance procedures in exCSIS countries (complex regulatory environment).",
}

export const keyMetrics = {
  monthlyTradingVolume: "~1 MT/month across all products",
  monthlyCrudeOilVolume: "2–3 BBLs Crude oil",
  storageCapacity: "300,000+ MTS",
  globalRelationships: "110+ reliable partners across 5 regions",
}

export const trading = {
  mission: "Maximizing value across the entire supply chain.",
  coreActivities: [
    "crude oil & petroleum product trading",
    "shipping & freight optimization",
    "storage management",
    "hedging & risk management",
  ],
  strategicPresence: ["Europe", "Africa", "Middle East", "Latin America"],
  monthlyVolumes: {
    oilProducts: "~1MT Oil Products",
    crudeOil: "2–3 BBLs Crude oil",
  },
  focusRegions: [
    "Mediterranean Sea",
    "Black Sea",
    "North Africa",
    "West Africa",
    "South America",
  ],
  contractTypes: [
    "Annual term contracts with various National Oil Companies",
    "Term/spot with major refineries and private importers",
  ],
  productVolumes: [
    { product: "ULSD", volume: "350 KT" },
    { product: "Fuel Oil", volume: "300 KT" },
    { product: "HSGO", volume: "100 KT" },
    { product: "Gasoline", volume: "100 KT" },
    { product: "VGO", volume: "90 KT" },
    { product: "Crude Oil", volume: "2–3m BBLs" },
  ],
  businessProcedure: [
    "Supplier (GPN, Surgut, Tatneft, Taif), prepayment",
    "FOB Baltic and Black Sea ports",
    "Loading & LC opening from the receiver",
    "Delivery 15–40 days depending on destination",
    "Payment as per LC 30–45 days depending on client",
  ],
  selectedOperations: [
    {
      description: "90,000 MT ULSD 10PPM",
      type: "spot",
    },
    {
      description: "40,000 MT Fuel Oil/month to 3 private buyers under a term agreement",
      type: "term",
    },
    {
      description: "90,000–120,000 MT/month ULSD 10PPM",
      type: "term",
    },
    {
      description: "Gasoline supplied to National Oil Company YPFB under a term agreement",
      type: "term",
    },
  ],
  jetA1Bolivia: {
    totalDemand: "14,000 cbm/month",
    airports: [
      {
        name: "Viru Viru (Santa Cruz)",
        demand: "6,000 cbm/month",
        route: "Campana (Argentina) → Yacuiba Customs (Bolivia)",
        voyageTime: "30hr",
      },
      {
        name: "Jeorge Wilstermann (Cochabamba)",
        demand: "4,000 cbm/month",
        route: "Campana (Argentina) → Yacuiba Customs (Bolivia)",
        voyageTime: "20hr",
      },
      {
        name: "El Alto (La Paz)",
        demand: "4,000 cbm/month",
        route: "Campana (Argentina) → Yacuiba Customs (Bolivia)",
        voyageTime: "22hr",
      },
    ],
  },
  ghanaSenegal: [
    {
      location: "Ghana",
      product: "ULSD10PPM",
      volume: "30,000 MT",
      frequency: "every 2 months",
      destination: "Tema port",
    },
    {
      location: "Senegal",
      product: "Fuel oil (HSFO)",
      volume: "30,000 MT/month",
      destination: "Dakar",
    },
  ],
}

export const storage = {
  description: "Strategically located storage facilities in the Mediterranean and Black Sea regions",
  logistics: "Supported by shipping and Danube river barge logistics",
  serbiaStrategicReserves: "Since 2014, FUTURA has also maintained strategic reserves on behalf of the Republic of Serbia.",
  capacities: [
    { location: "Romania", capacity: "60,000 MTS", notes: null },
    { location: "Mersin, Turkey", capacity: "65,000 MTS", notes: null },
    { location: "Mersin, Turkey", capacity: "30,000 MTS", notes: null },
    { location: "Serbia", capacity: "100,000 Ts", notes: "500,000 Ts planned" },
    { location: "Morocco", capacity: "55,000 MTS planned", notes: null },
    { location: "Romania", capacity: "60,000 MTS", notes: "Bitumen" },
  ],
}

export const shipping = {
  description: "Presence in the shipping & vessel industry",
  team: "Professional chartering and vessel management team for freight optimization and revenue maximization",
  vesselTypes: [
    {
      class: "SUEZ/AFRA size vessels",
      use: "crude and heavy fuel products",
    },
    {
      class: "Handy/MR sized vessels",
      use: "clean petroleum products",
    },
  ],
}

export const advantages = [
  {
    category: "Established Relationships",
    description: "strong long-standing ties with major buyers across East & Southeast Europe",
  },
  {
    category: "Bespoke Solutions",
    description: "tailored volumes at short notice supported by storage capacity",
  },
  {
    category: "High Flexibility",
    description: "adaptable deadlines, product types, and contract structures",
  },
  {
    category: "Competitive Pricing",
    description: "expertise in arbitration and transportation cost optimisation",
  },
  {
    category: "Tailored Client Financing",
    description: "optionality in pricing, open accounts and delayed payment terms",
  },
  {
    category: "Strong Banking Access",
    description: "competitive financing through relationships with leading trade finance banks",
  },
]

export const compliance = {
  system: "Comprehensive Compliance Risk Management System for trade control/export regulations",
  dueDiligence: "Due diligence on counterparties to identify sanctions, reputational and ownership risks, including vessel-related risks",
  policies: [
    "KYC Procedure",
    "Sanctions Compliance",
    "Anti-Bribery & Corruption",
    "AML/CTF",
  ],
  monitoring: [
    "Continuous monitoring of regulatory changes",
    "Staff training",
    "Advisory support to counterparties",
  ],
}

export const riskManagement = {
  importance: "Risk management is one of the main functions",
  activities: [
    "Implementation of key Risk Management activities",
    "Risk monitoring, control and reporting internally & externally",
    "Continuous development",
  ],
  framework: {
    categories: [
      "Financial Risks",
      "Market Risks",
      "Compliance Risks",
      "Corporate Risks",
    ],
    measures: {
      financial: [
        "liquidity planning",
        "working capital management",
        "credit and collection policies",
      ],
      market: [
        "B2B pricing",
        "price hedging",
        "FX hedging",
        "commodity hedging",
      ],
      compliance: [
        "KYC",
        "compliance policies",
        "anti-bribery",
        "anti-corruption",
      ],
      corporate: [
        "business continuity planning",
        "backup systems IT",
        "careful supplier selection",
      ],
    },
  },
}

export const globalPresence = {
  headquarters: {
    city: "Dubai",
    country: "UAE",
    function: "Headquarters",
    region: "Middle East",
    coordinates: [55.2708, 25.2048] as [number, number],
  },
  operationalOffices: [
    {
      city: "Belgrade",
      country: "Serbia",
      function: "Operations",
      region: "Europe",
      coordinates: [20.4489, 44.7866] as [number, number],
    },
    {
      city: "Istanbul",
      country: "Turkey",
      function: "Operations",
      region: "Europe",
      coordinates: [28.9784, 41.0082] as [number, number],
    },
    {
      city: "Geneva",
      country: "Switzerland",
      function: "Trading",
      region: "Europe",
      coordinates: [6.1432, 46.2044] as [number, number],
    },
    {
      city: "Dubai",
      country: "UAE",
      function: "Trading",
      region: "Middle East",
      coordinates: [55.2708, 25.2048] as [number, number],
      note: "Dedicated trading office",
    },
    {
      city: "La Paz",
      country: "Bolivia",
      function: "Operations",
      region: "Latin America",
      coordinates: [-68.1193, -16.5000] as [number, number],
    },
    {
      city: "Dakar",
      country: "Senegal",
      function: "Operations",
      region: "Africa",
      coordinates: [-17.4677, 14.7167] as [number, number],
    },
    {
      city: "Accra",
      country: "Ghana",
      function: "Operations",
      region: "Africa",
      coordinates: [-0.1869, 5.6037] as [number, number],
    },
    {
      city: "Casablanca",
      country: "Morocco",
      function: "Operations",
      region: "Africa",
      coordinates: [-7.5898, 33.5731] as [number, number],
    },
  ],
}

