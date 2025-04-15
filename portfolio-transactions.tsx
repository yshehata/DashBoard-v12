"use client"

import { useState } from "react"
import { ArrowUpDown, Calendar, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Add default props and safe handling of undefined values
export function PortfolioTransactions({ data = {} }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [transactionType, setTransactionType] = useState("all")

  // Sample transaction data based on your model
  const transactions = [
    {
      date: "2025-04-10",
      symbol: "Alex. Mineral Oils",
      type: "Buy",
      quantity: 1000,
      price: 7.621,
      value: 7621,
      account: "Mubasher",
    },
    {
      date: "2025-04-07",
      symbol: "Alex. Mineral Oils",
      type: "Buy",
      quantity: 1000,
      price: 7.501,
      value: 7501,
      account: "Mubasher",
    },
    {
      date: "2025-03-15",
      symbol: "Baraka Bank",
      type: "Buy",
      quantity: 5000,
      price: 11.7,
      value: 58500,
      account: "Pharous",
    },
    {
      date: "2025-03-10",
      symbol: "Medinet Nasr Housing",
      type: "Sell",
      quantity: 2000,
      price: 4.35,
      value: 8700,
      account: "Rowad",
    },
    {
      date: "2025-02-28",
      symbol: "Faisal Islamic Bank",
      type: "Buy",
      quantity: 500,
      price: 33.5,
      value: 16750,
      account: "BR",
    },
    {
      date: "2025-02-15",
      symbol: "Mopco",
      type: "Buy",
      quantity: 750,
      price: 39.99,
      value: 29992.5,
      account: "Pharous",
    },
    {
      date: "2025-01-20",
      symbol: "Baraka Bank",
      type: "Dividend",
      quantity: 0,
      price: 0,
      value: 3600,
      account: "Pharous",
    },
  ]

  // Filter transactions based on search term and type
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = transactionType === "all" || transaction.type.toLowerCase() === transactionType.toLowerCase()

    return matchesSearch && matchesType
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Recent buy, sell, and dividend transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="dividend">Dividend</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" className="p-0 h-8 font-medium flex items-center gap-1">
                    Date <Calendar className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 h-8 font-medium flex items-center gap-1">
                    Symbol <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 h-8 font-medium flex items-center gap-1">
                    Type <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="font-medium">{transaction.symbol}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        transaction.type === "Buy"
                          ? "bg-blue-50 text-blue-800"
                          : transaction.type === "Sell"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-green-50 text-green-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{transaction.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{transaction.price.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{transaction.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{transaction.account}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
