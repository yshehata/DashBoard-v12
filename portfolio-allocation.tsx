"use client"

import { Cell, Pie, PieChart, Sector } from "recharts"
import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

// Fix the renderActiveShape function to handle undefined values
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
        {payload.symbol || ""}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`${((percent || 0) * 100).toFixed(2)}%`}
      </text>
    </g>
  )
}

// Add default props and safe handling of undefined values
export function PortfolioAllocation({ data = {} }) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Ensure data has default values to prevent undefined errors
  const safeData = {
    topHoldings: [],
    cashValue: 0,
    totalValue: 1, // Prevent division by zero
    ...data,
  }

  const holdingsData = (safeData.topHoldings || []).map((holding) => ({
    symbol: holding.symbol,
    value: holding.value,
  }))

  // Add cash as a holding
  holdingsData.push({
    symbol: "Cash",
    value: safeData.cashValue || 0,
  })

  // Calculate sector allocation (simplified example)
  const sectorData = [
    { name: "Banking", value: 448885 }, // Baraka Bank + Faisal Islamic Bank
    { name: "Housing", value: 304410 }, // Medinet Nasr Housing
    { name: "Oil & Gas", value: 158883 }, // Alex. Mineral Oils + Mopco
    { name: "Cash", value: safeData.cashValue || 0 },
  ]

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Holdings Allocation</CardTitle>
          <CardDescription>Distribution of your portfolio by holdings</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer className="h-[400px]">
            <PieChart width={400} height={400}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={holdingsData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {holdingsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sector Allocation</CardTitle>
          <CardDescription>Distribution of your portfolio by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <ChartContainer className="h-[200px]">
              <PieChart width={400} height={200}>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Allocation %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectorData.map((sector) => (
                <TableRow key={sector.name}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell className="text-right">{sector.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {((sector.value / (safeData.totalValue || 1)) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
