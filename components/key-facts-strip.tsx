"use client"

import { keyMetrics, companyOverview } from "@/src/content/imFacts"
import { useLanguage } from "@/src/contexts/language-context"
import { translateCompanyOverviewContent } from "@/src/utils/translate-imFacts"

export function KeyFactsStrip() {
  const { t, language } = useLanguage()
  const companyOverviewTranslated = translateCompanyOverviewContent(language)
  
  return (
    <section className="py-16 px-8 bg-secondary/30">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center py-8">
            <div className="text-2xl font-normal text-foreground mb-1">
              {keyMetrics.monthlyTradingVolume.replace(" across all products", "")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("keyFacts.monthlyVolume")}
            </div>
          </div>
          <div className="text-center py-8">
            <div className="text-2xl font-normal text-foreground mb-1">
              {keyMetrics.storageCapacity}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("keyFacts.storage")}
            </div>
          </div>
          <div className="text-center py-8">
            <div className="text-2xl font-normal text-foreground mb-1">
              {companyOverview.incorporationYear}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("keyFacts.incorporation")}
            </div>
          </div>
          <div className="text-center py-8">
            <div className="text-2xl font-normal text-foreground mb-1">
              {companyOverview.employeeCount.replace(" professional employees", "")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("keyFacts.employees")}
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="text-sm text-muted-foreground">
            {companyOverviewTranslated.relationships.partners}
          </div>
        </div>
      </div>
    </section>
  )
}

