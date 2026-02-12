"use client"

import { useLanguage } from "@/src/contexts/language-context"
import { translateStorageContent } from "@/src/utils/translate-imFacts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function StorageCapacityTable() {
  const { t, language } = useLanguage()
  const storage = translateStorageContent(language)
  
  return (
    <div className="border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">{t("logisticsPage.location")}</TableHead>
            <TableHead>{t("logisticsPage.capacity")}</TableHead>
            <TableHead>{t("logisticsPage.notes")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {storage.capacities.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.location}</TableCell>
              <TableCell>{item.capacity}</TableCell>
              <TableCell className="text-muted-foreground">
                {item.notes || t("common.dash")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

