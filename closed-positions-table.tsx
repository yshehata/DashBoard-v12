"use client"

import { useState } from "react"
import { ArrowUpDown, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ClosedPositionsTable({ closedPositions = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("realizedReturn")
  const [sortDirection, setSortDirection] = useState("desc")
  const [statusFilter, setStatusFilter] = useState("all")

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Group positions by status
  const ytdClear = closedPositions.filter(
    (p) =>
      p.status === "YTD Clear" || (p.closeDate && new Date(p.closeDate).getFullYear() === new Date().getFullYear()),
  )

  const pydClear = closedPositions.filter(
    (p) =>
      p.status === "PYD Clear" ||
      (p.closeDate && new Date(p.closeDate).getFullYear() === new Date().getFullYear() - 1) ||
      new Date(p.closeDate).getFullYear() === new Date().getFullYear() - 2,
  )

  const clearedRE = closedPositions.filter(
    (p) =>
      p.status === "Cleared-RE" || (p.closeDate && new Date(p.closeDate).getFullYear() < new Date().getFullYear() - 2),
  )

  // Filter positions based on search term and status
  const getFilteredPositions = (positions) => {
    return positions.filter((position) => position.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  // Get positions based on selected tab
  const getPositionsForTab = () => {
    switch (statusFilter) {
      case "ytd":
        return getFilteredPositions(ytdClear)
      case "pyd":
        return getFilteredPositions(pydClear)
      case "re":
        return getFilteredPositions(clearedRE)
      default:
        return getFilteredPositions(closedPositions)
    }
  }

  const filteredPositions = getPositionsForTab()

  const sortedPositions = [...filteredPositions].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] - b[sortField]
    } else {
      return b[sortField] - a[sortField]
    }
  })

  // Calculate totals for the current filtered view
  const totalCost = sortedPositions.reduce((sum, position) => sum + position.cost, 0)
  const totalRealized = sortedPositions.reduce((sum, position) => sum + position.realizedReturn, 0)
  const totalReturnPercent = totalCost > 0 ? (totalRealized / totalCost) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Closed Positions</CardTitle>
        <CardDescription>Positions closed with realized returns</CardDescription>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Closed ({closedPositions.length})</TabsTrigger>
              <TabsTrigger value="ytd">YTD Clear ({ytdClear.length})</TabsTrigger>
              <TabsTrigger value="pyd">PYD Clear ({pydClear.length})</TabsTrigger>
              <TabsTrigger value="re">Cleared-RE ({clearedRE.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search closed positions..."
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
                    onClick={() => handleSort("closeDate")}
                  >
                    Close Date <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center gap-1"
                    onClick={() => handleSort("status")}
                  >
                    Status <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("cost")}
                  >
                    Cost Basis <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("proceeds")}
                  >
                    Proceeds <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 h-8 font-medium flex items-center justify-end gap-1"
                    onClick={() => handleSort("realizedReturn")}
                  >
                    Realized Return <ArrowUpDown className="ml-1 h-3 w-3" />
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
              {sortedPositions.map((position, index) => (
                <TableRow key={`${position.symbol}-${index}`}>
                  <TableCell className="font-medium">{position.symbol}</TableCell>
                  <TableCell>
                    {position.closeDate ? new Date(position.closeDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>{position.status || "Closed"}</TableCell>
                  <TableCell className="text-right">{position.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{position.proceeds.toLocaleString()}</TableCell>
                  <TableCell
                    className={`text-right ${position.realizedReturn >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {position.realizedReturn >= 0 ? "+" : ""}
                    {position.realizedReturn.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right ${position.return >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {position.return >= 0 ? "+" : ""}
                    {position.return.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell colSpan={3}>TOTAL</TableCell>
                <TableCell className="text-right">{totalCost.toLocaleString()}</TableCell>
                <TableCell className="text-right">{(totalCost + totalRealized).toLocaleString()}</TableCell>
                <TableCell className={`text-right ${totalRealized >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {totalRealized >= 0 ? "+" : ""}
                  {totalRealized.toLocaleString()}
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
