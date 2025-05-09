"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { PortfolioData } from "@/lib/data-processor"

interface MonthlyChartProps {
  data: PortfolioData
  selectedAccount?: string
}

export function MonthlyChart({ data, selectedAccount = "all" }: MonthlyChartProps) {
  // Process time series data to get monthly values
  const monthlyData = useMemo(() => {
    if (!data || !data.timeSeriesData) return []

    // Filter time series data for the selected account
    const filteredData = data.timeSeriesData.filter(
      (entry) => selectedAccount === "all" || entry.account === selectedAccount,
    )

    // Group by month and calculate monthly values
    const monthlyMap = new Map()

    filteredData.forEach((entry) => {
      if (!entry.date) return

      const date = new Date(entry.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          totalPortfolioValue: 0,
          totalValuePositions: 0,
          totalValueDeposits: 0,
          equityValue: 0,
          cashBalance: 0,
          date: new Date(date.getFullYear(), date.getMonth(), 1),
        })
      }

      const monthData = monthlyMap.get(monthKey)

      // Update with the latest values for the month
      if (new Date(entry.date) > monthData.date) {
        monthData.totalPortfolioValue = entry.totalValue || 0
        monthData.totalValuePositions = entry.equityValue || 0
        monthData.totalValueDeposits = entry.cashValue || 0
        monthData.equityValue = entry.equityValue || 0
        monthData.cashBalance = entry.cashValue || 0
        monthData.date = new Date(entry.date)
      }
    })

    // Convert map to array and sort by date
    return Array.from(monthlyMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((item) => ({
        ...item,
        month: new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      }))
  }, [data, selectedAccount])

  // Format numbers with zero decimals
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Portfolio Value (Measure 1.6)</CardTitle>
          <CardDescription>Total Portfolio Value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              totalPortfolioValue: {
                label: "Total Portfolio Value",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatNumber(value)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalPortfolioValue"
                  stroke="var(--color-totalPortfolioValue)"
                  name="Total Portfolio Value"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Positions Value (Measure 1.4)</CardTitle>
            <CardDescription>Total Value (Positions) over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                totalValuePositions: {
                  label: "Positions Value",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatNumber(value)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalValuePositions"
                    stroke="var(--color-totalValuePositions)"
                    name="Positions Value"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Deposits Value (Measure 1.5)</CardTitle>
            <CardDescription>Total Value (Deposits) over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                totalValueDeposits: {
                  label: "Deposits Value",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatNumber(value)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalValueDeposits"
                    stroke="var(--color-totalValueDeposits)"
                    name="Deposits Value"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Portfolio Composition</CardTitle>
            <CardDescription>Equity vs Cash Balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                equityValue: {
                  label: "Equity Value",
                  color: "hsl(var(--chart-4))",
                },
                cashBalance: {
                  label: "Cash Balance",
                  color: "hsl(var(--chart-5))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatNumber(value)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="equityValue"
                    stroke="var(--color-equityValue)"
                    name="Equity Value"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="cashBalance"
                    stroke="var(--color-cashBalance)"
                    name="Cash Balance"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
