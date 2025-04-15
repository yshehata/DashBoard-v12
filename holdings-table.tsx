"use client"

import { useState } from "react"
import { ArrowUpDown, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function HoldingsTable({ holdings = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("value")
  const [sortDirection, setSortDirection] = useState("desc")

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const filteredHoldings = holdings.filter(
    (holding) =>
      holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (holding.name && holding.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (holding.sector && holding.sector.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] - b[sortField]
    } else {
      return b[sortField] - a[sortField]
    }
  })

  // Calculate totals
  const totalValue = sortedHoldings.reduce((sum, holding) => sum + holding.value, 0)
  const totalCost = sortedHoldings.reduce((sum, holding) => sum + holding.cost, 0)
  const totalUnrealized = sortedHoldings.reduce((sum, holding) => sum + holding.unrealizedReturn, 0)
  const totalReturnPercent = totalCost > 0 ? (totalUnrealized / totalCost) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Holdings</CardTitle>
        <CardDescription>Your active portfolio positions</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search holdings..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center gap-1"
                    onClick={() => handleSort("symbol")}
                  >
                    Symbol <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center gap-1"
                    onClick={() => handleSort("name")}
                  >
                    Name <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center gap-1"
                    onClick={() => handleSort("sector")}
                  >
                    Sector <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center gap-1"
                    onClick={() => handleSort("quantity")}
                  >
                    Quantity <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("avgCost")}
                  >
                    Avg Cost <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("currentPrice")}
                  >
                    Price <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("value")}
                  >
                    Value <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("cost")}
                  >
                    Cost <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("unrealizedReturn")}
                  >
                    Unrealized <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("return")}
                  >
                    Return % <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => (
                <TableRow key={holding.symbol}>
                  <TableCell className="font-medium">{holding.symbol}</TableCell>
                  <TableCell>{holding.name || holding.symbol}</TableCell>
                  <TableCell>{holding.sector || "Unknown"}</TableCell>
                  <TableCell>{holding.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{holding.avgCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{holding.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{holding.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{holding.cost.toLocaleString()}</TableCell>
                  <TableCell
                    className={`text-right ${holding.unrealizedReturn >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {holding.unrealizedReturn >= 0 ? "+" : ""}
                    {holding.unrealizedReturn.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right ${holding.return >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {holding.return >= 0 ? "+" : ""}
                    {holding.return.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell colSpan={6}>TOTAL</TableCell>
                <TableCell className="text-right">{totalValue.toLocaleString()}</TableCell>
                <TableCell className="text-right">{totalCost.toLocaleString()}</TableCell>
                <TableCell className={`text-right ${totalUnrealized >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {totalUnrealized >= 0 ? "+" : ""}
                  {totalUnrealized.toLocaleString()}
                </TableCell>
                <TableCell className={`text-right ${totalReturnPercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {totalReturnPercent >= 0 ? "+" : ""}
                  {totalReturnPercent.toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
