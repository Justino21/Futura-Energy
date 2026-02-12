"use client"

import { useLanguage } from "@/src/contexts/language-context"
import { translateAdvantagesContent } from "@/src/utils/translate-imFacts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AdvantagesTable() {
  const { t, language } = useLanguage()
  const advantages = translateAdvantagesContent(language)
  
  return (
    <div className="border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">{t("tradingPage.category")}</TableHead>
            <TableHead>{t("tradingPage.description")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {advantages.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.category}</TableCell>
              <TableCell>{item.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

