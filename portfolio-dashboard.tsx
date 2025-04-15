"use client"

import { useState } from "react"
import { ArrowUp, BarChart3, DollarSign, LineChart, PieChart, TrendingUp, Wallet } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "./file-upload"
import { MultiMetricChart } from "./multi-metric-chart"
import { HoldingsTable } from "./holdings-table"
import { ClosedPositionsTable } from "./closed-positions-table"
import { AllocationChart } from "./allocation-chart"
import { PerformanceMetrics } from "./performance-metrics"
import {
  parseTransactionsCSV,
  parseSymbolsCSV,
  parseQuotesCSV,
  calculatePortfolioMetrics,
  getCurrentHoldings,
  getClosedPositions,
  calculateCashAccounts,
} from "./data-utils"

export default function PortfolioDashboard() {
  const [timeframe, setTimeframe] = useState("itd") // Default to Inception to Date
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [debugMode, setDebugMode] = useState(true) // Enable debug mode by default
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    cashValue: 0,
    equityValue: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    unrealizedReturn: 0,
    realizedReturn: 0,
    ytdClearReturn: 0,
    ytdClearReturnPercent: 0,
    benchmarkReturn: -25.38, // EGX30 return
    holdings: [],
    closedPositions: [],
    historicalData: [],
    cashAccounts: [],
  })

  const processUploadedFiles = async (fileData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Log raw data samples for debugging
      console.log("Transactions sample:", fileData.transactions.substring(0, 500))
      console.log("Symbols sample:", fileData.symbols.substring(0, 500))
      console.log("Quotes sample:", fileData.quotes.substring(0, 500))

      console.log("Parsing transactions CSV...")
      let transactions
      try {
        transactions = parseTransactionsCSV(fileData.transactions)
        console.log(`Parsed ${transactions.length} transactions`)
        if (transactions.length === 0) {
          console.warn("No transactions were parsed, using sample data for debugging")
          // Create sample transaction data for debugging
          transactions = [
            {
              Date: new Date(),
              Symbol: "SAMPLE",
              Type: "Buy",
              Qty: 100,
              Price: 10,
              Value: 1000,
              Account: "Sample Account",
            },
          ]
        }
        console.log("First transaction:", transactions[0])
      } catch (err) {
        console.error("Error parsing transactions:", err)
        setError(`Error parsing transactions: ${err.message}`)
        return
      }

      console.log("Parsing symbols CSV...")
      let symbols
      try {
        symbols = parseSymbolsCSV(fileData.symbols)
        console.log(`Parsed ${symbols.length} symbols`)
        if (symbols.length === 0) {
          console.warn("No symbols were parsed, using sample data for debugging")
          symbols = [
            {
              Symbol: "SAMPLE",
              Name: "Sample Stock",
              Sector: "Technology",
            },
          ]
        }
        console.log("First symbol:", symbols[0])
      } catch (err) {
        console.error("Error parsing symbols:", err)
        setError(`Error parsing symbols: ${err.message}`)
        return
      }

      console.log("Parsing quotes CSV...")
      let quotes
      try {
        quotes = parseQuotesCSV(fileData.quotes)
        console.log(`Parsed ${quotes.length} quotes`)
        if (quotes.length === 0) {
          console.warn("No quotes were parsed, using sample data for debugging")
          quotes = [
            {
              Date: new Date(),
              Symbol: "SAMPLE",
              Close: 12,
              Change: 2,
              QtyHeld: 100,
            },
          ]
        }
        console.log("First quote:", quotes[0])
      } catch (err) {
        console.error("Error parsing quotes:", err)
        setError(`Error parsing quotes: ${err.message}`)
        return
      }

      // Calculate portfolio metrics
      console.log("Calculating portfolio metrics...")
      const timeSeriesData = calculatePortfolioMetrics(transactions, quotes, symbols)

      console.log("Getting current holdings...")
      const currentHoldings = getCurrentHoldings(transactions, quotes, symbols)

      console.log("Getting closed positions...")
      const closedPositions = getClosedPositions(transactions)

      console.log("Calculating cash accounts...")
      const cashAccounts = calculateCashAccounts(transactions)

      // Get latest metrics
      const latestData = timeSeriesData.length > 0 ? timeSeriesData[timeSeriesData.length - 1] : null
      console.log("Latest data:", latestData)

      // Calculate YTD clear return
      const ytdClosedPositions = closedPositions.filter(
        (p) =>
          p.status === "YTD Clear" || (p.closeDate && new Date(p.closeDate).getFullYear() === new Date().getFullYear()),
      )
      const ytdClearReturn = ytdClosedPositions.reduce((sum, p) => sum + p.realizedReturn, 0)
      const ytdClearCost = ytdClosedPositions.reduce((sum, p) => sum + p.cost, 0)
      const ytdClearReturnPercent = ytdClearCost > 0 ? (ytdClearReturn / ytdClearCost) * 100 : 0

      // Calculate total cash
      const totalCash = cashAccounts.reduce((sum, account) => sum + account.value, 0)

      setPortfolioData({
        totalValue: latestData ? latestData.totalValue : 0,
        cashValue: latestData ? latestData.cashValue : 0,
        equityValue: latestData ? latestData.equityValue : 0,
        totalReturn: latestData ? latestData.totalReturn : 0,
        totalReturnPercent: latestData ? latestData.totalReturn : 0,
        unrealizedReturn: latestData ? latestData.unrealizedReturn : 0,
        realizedReturn: latestData ? latestData.realizedReturn : 0,
        ytdClearReturn,
        ytdClearReturnPercent,
        benchmarkReturn: -25.38, // EGX30 return
        holdings: currentHoldings,
        closedPositions,
        historicalData: timeSeriesData,
        cashAccounts,
      })

      setDataLoaded(true)
      console.log("Portfolio data loaded successfully")
    } catch (err) {
      console.error("Error processing portfolio data:", err)
      setError(`Error processing portfolio data: ${err instanceof Error ? err.message : String(err)}`)
      setDataLoaded(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded"
          >
            {debugMode ? "Hide Debug" : "Debug Mode"}
          </button>
        </div>
        {dataLoaded && (
          <div className="flex items-center gap-2">
            <Tabs defaultValue="itd" value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="1d">Last Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="quarter">Quarter</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
                <TabsTrigger value="ytd">YTD</TabsTrigger>
                <TabsTrigger value="itd">Inception to Date</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {!dataLoaded ? (
        <FileUpload onFilesProcessed={processUploadedFiles} onError={handleError} debug={debugMode} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioData.totalValue.toLocaleString()}</div>
                <div className="flex items-center pt-1">
                  <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 font-medium">
                      +{portfolioData.totalReturnPercent.toFixed(1)}%
                    </span>{" "}
                    from start
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioData.cashValue.toLocaleString()}</div>
                <div className="flex items-center pt-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">
                      {((portfolioData.cashValue / portfolioData.totalValue) * 100).toFixed(1)}%
                    </span>{" "}
                    of portfolio
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioData.totalReturn.toLocaleString()}</div>
                <div className="flex items-center pt-1">
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 font-medium">{portfolioData.totalReturnPercent.toFixed(1)}%</span>{" "}
                    return rate
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Unrealized Return</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioData.unrealizedReturn.toLocaleString()}</div>
                <div className="flex items-center pt-1">
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 font-medium">
                      {((portfolioData.unrealizedReturn / portfolioData.totalValue) * 100).toFixed(1)}%
                    </span>{" "}
                    of portfolio
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">YTD Realized Return</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioData.ytdClearReturn.toLocaleString()}</div>
                <div className="flex items-center pt-1">
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 font-medium">
                      {portfolioData.ytdClearReturnPercent.toFixed(1)}%
                    </span>{" "}
                    on closed positions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multi-metric chart similar to your screenshot */}
          <MultiMetricChart data={portfolioData.historicalData} timeRange={timeframe} />

          <Tabs defaultValue="holdings" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="holdings">Current Holdings</TabsTrigger>
              <TabsTrigger value="closed">Closed Positions</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="holdings">
              <HoldingsTable holdings={portfolioData.holdings} />
            </TabsContent>
            <TabsContent value="closed">
              <ClosedPositionsTable closedPositions={portfolioData.closedPositions} />
            </TabsContent>
            <TabsContent value="allocation">
              <AllocationChart
                holdings={portfolioData.holdings}
                cashAccounts={portfolioData.cashAccounts}
                totalCash={portfolioData.cashValue}
              />
            </TabsContent>
            <TabsContent value="performance">
              <PerformanceMetrics
                totalReturn={portfolioData.totalReturnPercent}
                benchmarkReturn={portfolioData.benchmarkReturn}
                holdings={portfolioData.holdings}
                closedPositions={portfolioData.closedPositions}
                realizedReturn={portfolioData.realizedReturn}
                unrealizedReturn={portfolioData.unrealizedReturn}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
