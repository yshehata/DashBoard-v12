"use client"

import { useState } from "react"
import { Cell, Pie, PieChart, Sector, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#d884d8", "#d88484"]

const renderActiveShape = (props) => {
  if (!props) return null

  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !startAngle || !endAngle || !fill || !payload) {
    return null
  }

  const sin = Math.sin(-midAngle * (Math.PI / 180))
  const cos = Math.cos(-midAngle * (Math.PI / 180))
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin

  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? "start" : "end"

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
        {payload.name || ""}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`${((percent || 0) * 100).toFixed(2)}%`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={36} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`${value.toLocaleString()}`}
      </text>
    </g>
  )
}

export function AllocationChart({ holdings = [], cashAccounts = [], totalCash = 0 }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [chartType, setChartType] = useState("holdings")

  // Prepare holdings data
  const holdingsData = holdings.map((holding) => ({
    name: holding.symbol,
    value: holding.value,
  }))

  // Add cash as a holding if we don't have detailed cash accounts
  if (cashAccounts.length === 0 && totalCash > 0) {
    holdingsData.push({
      name: "Cash",
      value: totalCash,
    })
  } else {
    // Add individual cash accounts
    cashAccounts.forEach((account) => {
      if (account.value > 0) {
        holdingsData.push({
          name: account.name,
          value: account.value,
        })
      }
    })
  }

  // Calculate sector allocation
  const sectorMap = new Map()

  // Add holdings by sector
  holdings.forEach((holding) => {
    const sector = holding.sector || "Other"
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, 0)
    }
    sectorMap.set(sector, sectorMap.get(sector) + holding.value)
  })

  // Add cash to sectors
  if (totalCash > 0) {
    sectorMap.set("Cash", totalCash)
  }

  const sectorData = Array.from(sectorMap.entries())
    .map(([name, value]) => ({
      name,
      value,
    }))
    .filter((sector) => sector.value > 0)

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  const chartData = chartType === "holdings" ? holdingsData : sectorData

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>Distribution of your investments</CardDescription>
        <Tabs defaultValue="holdings" value={chartType} onValueChange={setChartType} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="holdings">By Holdings</TabsTrigger>
            <TabsTrigger value="sectors">By Sectors</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
