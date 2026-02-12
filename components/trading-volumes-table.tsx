"use client"

import { useLanguage } from "@/src/contexts/language-context"
import { translateTradingContent } from "@/src/utils/translate-imFacts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TradingVolumesTable() {
  const { t, language } = useLanguage()
  const trading = translateTradingContent(language)
  
  return (
    <div className="border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">{t("tradingPage.product")}</TableHead>
            <TableHead>{t("tradingPage.monthlyVolume")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trading.productVolumes.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.product}</TableCell>
              <TableCell>{item.volume}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

