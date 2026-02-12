/**
 * Helper functions to translate content from imFacts.ts
 * This ensures all hardcoded content is properly translated
 */

import { getTranslation } from "@/src/translations/index"
import type { LanguageCode } from "@/src/translations/index"

export function translateTradingContent(lang: LanguageCode) {
  return {
    mission: getTranslation(lang, "trading.mission"),
    coreActivities: [
      getTranslation(lang, "imFacts.trading.coreActivities.trading"),
      getTranslation(lang, "imFacts.trading.coreActivities.shipping"),
      getTranslation(lang, "imFacts.trading.coreActivities.storage"),
      getTranslation(lang, "imFacts.trading.coreActivities.hedging"),
    ],
    strategicPresence: [
      getTranslation(lang, "imFacts.trading.strategicPresence.europe"),
      getTranslation(lang, "imFacts.trading.strategicPresence.africa"),
      getTranslation(lang, "imFacts.trading.strategicPresence.middleEast"),
      getTranslation(lang, "imFacts.trading.strategicPresence.latinAmerica"),
    ],
    focusRegions: [
      getTranslation(lang, "imFacts.trading.focusRegions.mediterranean"),
      getTranslation(lang, "imFacts.trading.focusRegions.blackSea"),
      getTranslation(lang, "imFacts.trading.focusRegions.northAfrica"),
      getTranslation(lang, "imFacts.trading.focusRegions.westAfrica"),
      getTranslation(lang, "imFacts.trading.focusRegions.southAmerica"),
    ],
    monthlyVolumes: {
      oilProducts: getTranslation(lang, "imFacts.trading.monthlyVolumes.oilProducts"),
      crudeOil: getTranslation(lang, "imFacts.trading.monthlyVolumes.crudeOil"),
    },
    contractTypes: [
      getTranslation(lang, "imFacts.trading.contractTypes.annual"),
      getTranslation(lang, "imFacts.trading.contractTypes.termSpot"),
    ],
    businessProcedure: [
      getTranslation(lang, "imFacts.trading.businessProcedure.supplier"),
      getTranslation(lang, "imFacts.trading.businessProcedure.fob"),
      getTranslation(lang, "imFacts.trading.businessProcedure.loading"),
      getTranslation(lang, "imFacts.trading.businessProcedure.delivery"),
      getTranslation(lang, "imFacts.trading.businessProcedure.payment"),
    ],
    productVolumes: [
      { product: getTranslation(lang, "imFacts.trading.products.ulsd"), volume: "350 KT" },
      { product: getTranslation(lang, "imFacts.trading.products.fuelOil"), volume: "300 KT" },
      { product: getTranslation(lang, "imFacts.trading.products.hsgo"), volume: "100 KT" },
      { product: getTranslation(lang, "imFacts.trading.products.gasoline"), volume: "100 KT" },
      { product: getTranslation(lang, "imFacts.trading.products.vgo"), volume: "90 KT" },
      { product: getTranslation(lang, "imFacts.trading.products.crudeOil"), volume: "2–3m BBLs" },
    ],
  }
}

export function translateStorageContent(lang: LanguageCode) {
  return {
    description: getTranslation(lang, "imFacts.storage.description"),
    logistics: getTranslation(lang, "imFacts.storage.logistics"),
    serbiaStrategicReserves: getTranslation(lang, "imFacts.storage.serbiaStrategicReserves"),
    storageCapacitySupports: getTranslation(lang, "imFacts.storage.storageCapacitySupports"),
    capacities: [
      { location: getTranslation(lang, "imFacts.storage.locations.romania"), capacity: "60,000 MTS", notes: null },
      { location: getTranslation(lang, "imFacts.storage.locations.mersinTurkey"), capacity: "65,000 MTS", notes: null },
      { location: getTranslation(lang, "imFacts.storage.locations.mersinTurkey"), capacity: "30,000 MTS", notes: null },
      { location: getTranslation(lang, "imFacts.storage.locations.serbia"), capacity: "100,000 Ts", notes: "500,000 Ts " + getTranslation(lang, "imFacts.storage.notes.planned") },
      { location: getTranslation(lang, "imFacts.storage.locations.morocco"), capacity: "55,000 MTS " + getTranslation(lang, "imFacts.storage.notes.planned"), notes: null },
      { location: getTranslation(lang, "imFacts.storage.locations.romania"), capacity: "60,000 MTS", notes: getTranslation(lang, "imFacts.storage.notes.bitumen") },
    ],
  }
}

export function translateShippingContent(lang: LanguageCode) {
  return {
    description: getTranslation(lang, "imFacts.shipping.description"),
    team: getTranslation(lang, "imFacts.shipping.team"),
    vesselTypes: [
      {
        class: getTranslation(lang, "imFacts.shipping.vesselTypes.suezAfra"),
        use: getTranslation(lang, "imFacts.shipping.vesselTypes.suezAfraUse"),
      },
      {
        class: getTranslation(lang, "imFacts.shipping.vesselTypes.handyMr"),
        use: getTranslation(lang, "imFacts.shipping.vesselTypes.handyMrUse"),
      },
    ],
  }
}

export function translateComplianceContent(lang: LanguageCode) {
  return {
    system: getTranslation(lang, "imFacts.compliance.system"),
    policies: [
      getTranslation(lang, "imFacts.compliance.policies.kyc"),
      getTranslation(lang, "imFacts.compliance.policies.sanctions"),
      getTranslation(lang, "imFacts.compliance.policies.antiBribery"),
      getTranslation(lang, "imFacts.compliance.policies.amlCtf"),
    ],
    monitoring: [
      getTranslation(lang, "imFacts.compliance.monitoring.regulatory"),
      getTranslation(lang, "imFacts.compliance.monitoring.training"),
      getTranslation(lang, "imFacts.compliance.monitoring.advisory"),
    ],
  }
}

export function translateRiskManagementContent(lang: LanguageCode) {
  return {
    importance: getTranslation(lang, "imFacts.riskManagement.importance"),
    activities: [
      getTranslation(lang, "imFacts.riskManagement.activities.implementation"),
      getTranslation(lang, "imFacts.riskManagement.activities.monitoring"),
      getTranslation(lang, "imFacts.riskManagement.activities.development"),
    ],
    framework: {
      categories: [
        getTranslation(lang, "imFacts.riskManagement.framework.categories.financial"),
        getTranslation(lang, "imFacts.riskManagement.framework.categories.market"),
        getTranslation(lang, "imFacts.riskManagement.framework.categories.compliance"),
        getTranslation(lang, "imFacts.riskManagement.framework.categories.corporate"),
      ],
      measures: {
        financial: [
          getTranslation(lang, "imFacts.riskManagement.framework.measures.financial.liquidity"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.financial.workingCapital"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.financial.credit"),
        ],
        market: [
          getTranslation(lang, "imFacts.riskManagement.framework.measures.market.b2b"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.market.priceHedging"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.market.fxHedging"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.market.commodityHedging"),
        ],
        compliance: [
          getTranslation(lang, "imFacts.riskManagement.framework.measures.compliance.kyc"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.compliance.policies"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.compliance.antiBribery"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.compliance.antiCorruption"),
        ],
        corporate: [
          getTranslation(lang, "imFacts.riskManagement.framework.measures.corporate.continuity"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.corporate.backup"),
          getTranslation(lang, "imFacts.riskManagement.framework.measures.corporate.supplier"),
        ],
      },
    },
    frameworkCovers: getTranslation(lang, "imFacts.riskManagement.frameworkCovers"),
  }
}

export function translateAdvantagesContent(lang: LanguageCode) {
  return [
    {
      category: getTranslation(lang, "imFacts.advantages.establishedRelationships"),
      description: getTranslation(lang, "imFacts.advantages.establishedRelationshipsDesc"),
    },
    {
      category: getTranslation(lang, "imFacts.advantages.bespokeSolutions"),
      description: getTranslation(lang, "imFacts.advantages.bespokeSolutionsDesc"),
    },
    {
      category: getTranslation(lang, "imFacts.advantages.highFlexibility"),
      description: getTranslation(lang, "imFacts.advantages.highFlexibilityDesc"),
    },
    {
      category: getTranslation(lang, "imFacts.advantages.competitivePricing"),
      description: getTranslation(lang, "imFacts.advantages.competitivePricingDesc"),
    },
    {
      category: getTranslation(lang, "imFacts.advantages.tailoredFinancing"),
      description: getTranslation(lang, "imFacts.advantages.tailoredFinancingDesc"),
    },
    {
      category: getTranslation(lang, "imFacts.advantages.bankingAccess"),
      description: getTranslation(lang, "imFacts.advantages.bankingAccessDesc"),
    },
  ]
}

export function translateCompanyOverviewContent(lang: LanguageCode) {
  return {
    description: getTranslation(lang, "imFacts.companyOverview.description"),
    employeeCount: getTranslation(lang, "imFacts.companyOverview.employeeCount"),
    relationships: {
      description: getTranslation(lang, "imFacts.companyOverview.relationships.description"),
      partners: getTranslation(lang, "imFacts.companyOverview.relationships.partners"),
    },
    focus: getTranslation(lang, "imFacts.companyOverview.focus"),
  }
}

export function translateGlobalPresenceContent(lang: LanguageCode) {
  return {
    functions: {
      headquarters: getTranslation(lang, "imFacts.globalPresence.functions.headquarters"),
      trading: getTranslation(lang, "imFacts.globalPresence.functions.trading"),
      operations: getTranslation(lang, "imFacts.globalPresence.functions.operations"),
    },
    notes: {
      dedicatedTradingOffice: getTranslation(lang, "imFacts.globalPresence.notes.dedicatedTradingOffice"),
      operationalTeam: getTranslation(lang, "imFacts.globalPresence.notes.operationalTeam"),
    },
    regions: {
      europe: getTranslation(lang, "imFacts.globalPresence.regions.europe"),
      middleEast: getTranslation(lang, "imFacts.globalPresence.regions.middleEast"),
      africa: getTranslation(lang, "imFacts.globalPresence.regions.africa"),
      latinAmerica: getTranslation(lang, "imFacts.globalPresence.regions.latinAmerica"),
    },
    countries: {
      serbia: getTranslation(lang, "imFacts.globalPresence.countries.serbia"),
      turkey: getTranslation(lang, "imFacts.globalPresence.countries.turkey"),
      switzerland: getTranslation(lang, "imFacts.globalPresence.countries.switzerland"),
      uae: getTranslation(lang, "imFacts.globalPresence.countries.uae"),
      bolivia: getTranslation(lang, "imFacts.globalPresence.countries.bolivia"),
      senegal: getTranslation(lang, "imFacts.globalPresence.countries.senegal"),
      ghana: getTranslation(lang, "imFacts.globalPresence.countries.ghana"),
      morocco: getTranslation(lang, "imFacts.globalPresence.countries.morocco"),
    },
    cities: {
      dubai: getTranslation(lang, "imFacts.globalPresence.cities.dubai"),
      geneva: getTranslation(lang, "imFacts.globalPresence.cities.geneva"),
      belgrade: getTranslation(lang, "imFacts.globalPresence.cities.belgrade"),
      istanbul: getTranslation(lang, "imFacts.globalPresence.cities.istanbul"),
      laPaz: getTranslation(lang, "imFacts.globalPresence.cities.laPaz"),
      dakar: getTranslation(lang, "imFacts.globalPresence.cities.dakar"),
      accra: getTranslation(lang, "imFacts.globalPresence.cities.accra"),
      casablanca: getTranslation(lang, "imFacts.globalPresence.cities.casablanca"),
    },
  }
}

