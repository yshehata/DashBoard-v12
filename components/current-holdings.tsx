import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const holdings = [
  { id: 1, symbol: "AAPL", shares: 25, price: "$187.50", value: "$4,687.50", change: "+1.2%", status: "up" },
  { id: 2, symbol: "MSFT", shares: 15, price: "$325.30", value: "$4,879.50", change: "-0.5%", status: "down" },
  { id: 3, symbol: "GOOGL", shares: 10, price: "$135.60", value: "$1,356.00", change: "+0.8%", status: "up" },
  { id: 4, symbol: "AMZN", shares: 8, price: "$145.20", value: "$1,161.60", change: "+1.5%", status: "up" },
  { id: 5, symbol: "NVDA", shares: 20, price: "$450.70", value: "$9,014.00", change: "+2.3%", status: "up" },
]

export function CurrentHoldings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => (
              <TableRow key={holding.id}>
                <TableCell>{holding.symbol}</TableCell>
                <TableCell>{holding.shares}</TableCell>
                <TableCell>{holding.price}</TableCell>
                <TableCell>{holding.value}</TableCell>
                <TableCell>
                  <Badge variant={holding.status === "up" ? "success" : "destructive"}>{holding.change}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
