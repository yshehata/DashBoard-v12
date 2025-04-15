"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function PerformanceMetrics({
  totalReturn = 0,
  benchmarkReturn = 0,
  holdings = [],
  closedPositions = [],
  realizedReturn = 0,
  unrealizedReturn = 0,
}) {
  // Calculate top performers
  const allPositions = [
    ...holdings.map((h) => ({
      symbol: h.symbol,
      return: h.return,
      value: h.value,
      returnValue: h.unrealizedReturn,
      status: "Active",
    })),
    ...closedPositions.map((p) => ({
      symbol: p.symbol,
      return: p.return,
      value: p.cost,
      returnValue: p.realizedReturn,
      status: "Closed",
    })),
  ]

  const topPerformers = [...allPositions]
    .sort((a, b) => b.returnValue - a.returnValue)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      return: p.return, // Make sure return is available for the chart
    }))

  const bottomPerformers = [...allPositions]
    .sort((a, b) => a.returnValue - b.returnValue)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      return: p.return, // Make sure return is available for the chart
    }))

  // Calculate alpha (outperformance vs benchmark)
  const alpha = totalReturn - benchmarkReturn

  // Calculate other metrics
  const volatility = 12.4 // This would be calculated from historical data
  const sharpeRatio = (totalReturn - 2) / volatility // Assuming 2% risk-free rate
  const maxDrawdown = -8.5 // This would be calculated from historical data

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Benchmark</CardTitle>
          <CardDescription>How your portfolio compares to the market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">Your Portfolio</span>
                </div>
                <span className="font-bold text-emerald-600">+{totalReturn.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(totalReturn * 3, 100)}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">EGX30 Index</span>
                </div>
                <span className="font-bold text-purple-600">+{benchmarkReturn.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-purple-500" style={{ width: `${Math.min(benchmarkReturn * 3, 100)}%` }} />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-2 text-sm font-medium">Alpha</h4>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${alpha >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {alpha >= 0 ? "+" : ""}
                  {alpha.toFixed(1)}%
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {alpha >= 0 ? "outperformance" : "underperformance"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
          <CardDescription>Risk and return indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Return</p>
              <p className="text-xl font-bold">{totalReturn.toFixed(1)}%</p>
            </div>
            <div className="space-y-1 rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Volatility</p>
              <p className="text-xl font-bold">{volatility}%</p>
            </div>
            <div className="space-y-1 rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Realized Return</p>
              <p className="text-xl font-bold">{realizedReturn.toLocaleString()}</p>
            </div>
            <div className="space-y-1 rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground">Unrealized Return</p>
              <p className="text-xl font-bold">{unrealizedReturn.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Your best performing positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPerformers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(value) => `${value.toLocaleString()}`} />
                <YAxis dataKey="symbol" type="category" width={100} />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()}`, "Return Value"]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="returnValue" fill="#10b981" radius={[0, 4, 4, 0]} name="Return Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bottom Performers</CardTitle>
          <CardDescription>Your worst performing positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottomPerformers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(value) => `${value.toLocaleString()}`} />
                <YAxis dataKey="symbol" type="category" width={100} />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()}`, "Return Value"]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="returnValue" fill="#ef4444" radius={[0, 4, 4, 0]} name="Return Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
