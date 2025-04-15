"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

// Add default props and safe handling of undefined values
export function PortfolioComparison({ data = {}, timeframe = "month" }) {
  // Ensure data has default values to prevent undefined errors
  const safeData = {
    benchmarkComparison: [],
    totalReturnPercent: 0,
    ...data,
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Performance vs Benchmark</CardTitle>
          <CardDescription>Comparing your portfolio to EGX30 index</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              portfolio: {
                label: "Portfolio",
                color: "hsl(var(--chart-1))",
              },
              benchmark: {
                label: "EGX30",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="aspect-[4/1] w-full"
          >
            <LineChart
              data={safeData.benchmarkComparison || []}
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
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke="var(--color-portfolio)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="var(--color-benchmark)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cumulative Performance</CardTitle>
          <CardDescription>Year-to-date performance comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[hsl(var(--chart-1))]" />
                  <span className="text-sm font-medium">Your Portfolio</span>
                </div>
                <span className="font-bold text-emerald-600">+{safeData.totalReturnPercent || 0}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-[hsl(var(--chart-1))]"
                  style={{ width: `${(safeData.totalReturnPercent || 0) * 5}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[hsl(var(--chart-2))]" />
                  <span className="text-sm font-medium">EGX30 Index</span>
                </div>
                <span className="font-bold text-emerald-600">+12.5%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-[hsl(var(--chart-2))]" style={{ width: `${12.5 * 5}%` }} />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-2 text-sm font-medium">Alpha</h4>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-emerald-600">
                  +{((safeData.totalReturnPercent || 0) - 12.5).toFixed(1)}%
                </span>
                <span className="ml-2 text-sm text-muted-foreground">outperformance</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key portfolio performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Dietz Return</p>
              <p className="text-xl font-bold">15.3%</p>
            </div>
            <div className="space-y-1 rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Sharpe Ratio</p>
              <p className="text-xl font-bold">1.24</p>
            </div>
            <div className="space-y-1 rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Beta</p>
              <p className="text-xl font-bold">0.85</p>
            </div>
            <div className="space-y-1 rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Max Drawdown</p>
              <p className="text-xl font-bold">-4.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
