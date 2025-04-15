"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

// Add default props and safe handling of undefined values
export function PortfolioPerformance({ data = {}, timeframe = "month" }) {
  // Ensure data has default values to prevent undefined errors
  const safeData = {
    topHoldings: [],
    monthlyPerformance: [],
    realizedReturn: 0,
    unrealizedReturn: 0,
    totalReturn: 1, // Prevent division by zero
    ...data,
  }

  // Calculate return contribution for each holding
  const returnContribution = (safeData.topHoldings || [])
    .map((holding) => ({
      symbol: holding.symbol,
      value: ((holding.value * holding.return) / 100).toFixed(0),
      percent: holding.return,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Monthly Return Rate</CardTitle>
          <CardDescription>Portfolio return percentage by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              return: {
                label: "Return %",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="aspect-[4/1] w-full"
          >
            <BarChart
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
              <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="return" fill="var(--color-return)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return Contribution</CardTitle>
          <CardDescription>Top contributors to portfolio return</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Return Value",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="aspect-[4/3] w-full"
          >
            <BarChart
              data={returnContribution}
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
              <YAxis dataKey="symbol" type="category" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[0, 4, 4, 0]}
                // Color bars based on positive/negative values
                fill={(data) => (data.percent >= 0 ? "#10b981" : "#ef4444")}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return Breakdown</CardTitle>
          <CardDescription>Realized vs Unrealized Returns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">Realized Return</p>
                <p className="text-2xl font-bold">{(safeData.realizedReturn || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {((safeData.realizedReturn / (safeData.totalReturn || 1)) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="space-y-2 rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">Unrealized Return</p>
                <p className="text-2xl font-bold">{(safeData.unrealizedReturn || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {((safeData.unrealizedReturn / (safeData.totalReturn || 1)) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>

            <div className="relative pt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span>Realized</span>
                <span>Unrealized</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(safeData.realizedReturn / (safeData.totalReturn || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
