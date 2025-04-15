"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ComposedChart, ResponsiveContainer } from "recharts"

// Custom tooltip component with improved positioning
const CustomTooltip = ({ active, payload, label, coordinate }) => {
  if (active && payload && payload.length) {
    // Calculate position to avoid going off-screen
    // Move tooltip to the right side of the chart
    const tooltipStyle = {
      backgroundColor: "white",
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      position: "absolute",
      left: coordinate.x + 20, // Move tooltip to the right of the cursor
      top: coordinate.y - 100, // Position above the cursor
      zIndex: 1000,
      minWidth: "200px",
    }

    // Format date
    let formattedDate = label
    try {
      const date = new Date(label)
      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })
      }
    } catch (e) {
      console.warn("Error formatting date in tooltip", e)
    }

    // Color mapping for values
    const colorMap = {
      totalValue: "#8884d8",
      cashValue: "#82ca9d",
      realizedReturn: "#ffc658",
      egx30: "#8b008b",
      totalReturn: "#ff0000",
      unrealizedReturn: "#ff7f50",
    }

    return (
      <div style={tooltipStyle}>
        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{formattedDate}</p>
        {payload.map((entry, index) => {
          let displayName = entry.name
          let value = entry.value

          // Format display names and values
          switch (entry.name) {
            case "totalValue":
              displayName = "Total Value"
              break
            case "cashValue":
              displayName = "Cash Value"
              break
            case "realizedReturn":
              displayName = "Realized Return"
              break
            case "egx30":
              displayName = "EGX30"
              value = `${value.toFixed(2)}`
              break
            case "totalReturn":
              displayName = "Total Return"
              value = `${value.toFixed(1)}`
              break
            case "unrealizedReturn":
              displayName = "Unrealized Return"
              value = `${value.toFixed(1)}`
              break
          }

          // Format numbers with commas for thousands
          if (entry.name === "totalValue" || entry.name === "cashValue" || entry.name === "realizedReturn") {
            value = value.toLocaleString()
          }

          return (
            <p key={`tooltip-${index}`} style={{ color: colorMap[entry.name] || "#000", margin: "3px 0" }}>
              {displayName} : {value}
            </p>
          )
        })}
      </div>
    )
  }

  return null
}

export function MultiMetricChart({ data = [], timeRange = "all" }) {
  const [chartData, setChartData] = useState([])
  const [selectedTimeRange, setTimeRange] = useState(timeRange)
  const [tooltipCoordinate, setTooltipCoordinate] = useState({ x: 0, y: 0 })

  // Filter data based on selected time range
  useEffect(() => {
    if (!data || data.length === 0) return

    let filteredData = [...data]

    try {
      const now = new Date()

      if (selectedTimeRange === "1y") {
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        filteredData = data.filter((item) => {
          try {
            const itemDate = new Date(item.date)
            return !isNaN(itemDate.getTime()) && itemDate >= oneYearAgo
          } catch (e) {
            return false
          }
        })
      } else if (selectedTimeRange === "ytd") {
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        filteredData = data.filter((item) => {
          try {
            const itemDate = new Date(item.date)
            return !isNaN(itemDate.getTime()) && itemDate >= startOfYear
          } catch (e) {
            return false
          }
        })
      } else if (selectedTimeRange === "6m" || selectedTimeRange === "quarter") {
        const monthsAgo = selectedTimeRange === "6m" ? 6 : 3
        const cutoffDate = new Date()
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo)
        filteredData = data.filter((item) => {
          try {
            const itemDate = new Date(item.date)
            return !isNaN(itemDate.getTime()) && itemDate >= cutoffDate
          } catch (e) {
            return false
          }
        })
      } else if (selectedTimeRange === "month") {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        filteredData = data.filter((item) => {
          try {
            const itemDate = new Date(item.date)
            return !isNaN(itemDate.getTime()) && itemDate >= oneMonthAgo
          } catch (e) {
            return false
          }
        })
      } else if (selectedTimeRange === "week") {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        filteredData = data.filter((item) => {
          try {
            const itemDate = new Date(item.date)
            return !isNaN(itemDate.getTime()) && itemDate >= oneWeekAgo
          } catch (e) {
            return false
          }
        })
      } else if (selectedTimeRange === "1d") {
        // Get the most recent data point
        if (data.length > 0) {
          filteredData = [data[data.length - 1]]
        }
      }
      // "all" or "itd" will use all data
    } catch (error) {
      console.error("Error filtering data by date range:", error)
    }

    setChartData(filteredData)
  }, [data, selectedTimeRange])

  // Handle tooltip position
  const handleMouseMove = (e) => {
    if (e && e.activeCoordinate) {
      setTooltipCoordinate({
        x: e.activeCoordinate.x,
        y: e.activeCoordinate.y,
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Tracking multiple metrics over time</CardDescription>
        </div>
        <Select defaultValue={selectedTimeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="itd">Inception to Date</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="1d">Last Day</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              onMouseMove={handleMouseMove}
            >
              <defs>
                <linearGradient id="colorTotalValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorCashValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorRealizedReturn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  try {
                    const d = new Date(date)
                    if (!isNaN(d.getTime())) {
                      return `${d.getFullYear()}-${d.getMonth() + 1}`
                    }
                    return date
                  } catch (e) {
                    return date
                  }
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
                domain={[0, "dataMax + 100000"]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
                domain={[-80, 240]}
              />
              <Tooltip
                content={<CustomTooltip coordinate={tooltipCoordinate} />}
                cursor={{ stroke: "#ccc", strokeWidth: 1 }}
              />
              <Legend />

              {/* Total Value - Area Chart */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="totalValue"
                name="Total Value"
                fill="url(#colorTotalValue)"
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                stackId="1"
              />

              {/* Cash Value - Area Chart */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cashValue"
                name="Cash Value"
                fill="url(#colorCashValue)"
                stroke="#82ca9d"
                strokeWidth={2}
                stackId="2"
              />

              {/* Realized Return - Area Chart */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="realizedReturn"
                name="Realized Return"
                fill="url(#colorRealizedReturn)"
                stroke="#ffc658"
                strokeWidth={2}
                stackId="3"
              />

              {/* EGX30 - Line Chart */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="egx30"
                name="EGX30"
                stroke="#8b008b"
                strokeWidth={2}
                dot={false}
              />

              {/* Total Return - Line Chart */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalReturn"
                name="Total Return"
                stroke="#ff0000"
                strokeWidth={2}
                dot={false}
              />

              {/* Unrealized Return - Line Chart */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="unrealizedReturn"
                name="Unrealized Return"
                stroke="#ff7f50"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
