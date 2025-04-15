"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

// Add default props to handle undefined values
export function PortfolioSummary({ data = {}, timeframe = "month" }) {
  // Ensure data has default values to prevent undefined errors
  const safeData = {
    monthlyPerformance: [],
    topHoldings: [],
    cashAccounts: [],
    ...data,
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Portfolio Value Over Time</CardTitle>
          <CardDescription>Tracking your portfolio growth over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              portfolio: {
                label: "Portfolio Value",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="aspect-[4/1] w-full"
          >
            <AreaChart
              data={safeData.monthlyPerformance || []}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-portfolio)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-portfolio)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-portfolio)"
                fillOpacity={1}
                fill="url(#colorPortfolio)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Holdings</CardTitle>
          <CardDescription>Your best performing assets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Return %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(safeData.topHoldings || []).map((holding) => (
                <TableRow key={holding.symbol}>
                  <TableCell className="font-medium">{holding.symbol}</TableCell>
                  <TableCell className="text-right">{holding.value.toLocaleString()}</TableCell>
                  <TableCell className={`text-right ${holding.return >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {holding.return >= 0 ? "+" : ""}
                    {holding.return}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Accounts</CardTitle>
          <CardDescription>Distribution of cash across accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Value",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="aspect-[4/3] w-full"
          >
            <BarChart
              data={safeData.cashAccounts || []}
              layout="vertical"
              margin={{
                top: 5,
                right: 10,
                left: 80,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
