"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  onFilesProcessed: (processedData: any) => void
  onError: (error: string) => void
  debug?: boolean
}

export function FileUpload({ onFilesProcessed, onError, ...props }: FileUploadProps) {
  const [transactions, setTransactions] = useState<File | null>(null)
  const [symbols, setSymbols] = useState<File | null>(null)
  const [quotes, setQuotes] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<{
    transactionsSample?: string
    symbolsSample?: string
    quotesSample?: string
    transactionAnalysis?: any
    symbolAnalysis?: any
    quoteAnalysis?: any
  }>({})

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      switch (fileType) {
        case "transactions":
          setTransactions(file)
          break
        case "symbols":
          setSymbols(file)
          break
        case "quotes":
          setQuotes(file)
          break
      }
      // Reset error when a new file is selected
      setError(null)
    }
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          const content = e.target.result
          // Store sample of file content for debugging
          if (file === transactions) {
            setDebugInfo((prev) => ({ ...prev, transactionsSample: content.substring(0, 500) }))
          } else if (file === symbols) {
            setDebugInfo((prev) => ({ ...prev, symbolsSample: content.substring(0, 500) }))
          } else if (file === quotes) {
            setDebugInfo((prev) => ({ ...prev, quotesSample: content.substring(0, 500) }))
          }
          resolve(content)
        } else {
          reject(new Error("Failed to read file"))
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const analyzeCSV = (content, fileType) => {
    if (!content || typeof content !== "string") return "Invalid content"

    const lines = content.split("\n").filter((line) => line.trim())
    if (lines.length === 0) return "No data found"

    // Detect delimiter
    const firstLine = lines[0]
    let delimiter = ","
    if (firstLine.includes(";")) delimiter = ";"
    if (firstLine.includes("\t")) delimiter = "\t"

    // Get first few lines
    const sampleLines = lines.slice(0, Math.min(5, lines.length))

    // Analyze headers
    const headers = sampleLines[0].split(delimiter).map((h) => h.trim())
    const secondRowHeaders = sampleLines.length > 1 ? sampleLines[1].split(delimiter).map((h) => h.trim()) : []

    return {
      totalLines: lines.length,
      delimiter,
      headers,
      secondRowHeaders,
      sampleLines,
    }
  }

  const processFiles = async () => {
    if (!transactions || !symbols || !quotes) {
      setError("Please upload all required files")
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)
    setError(null)

    try {
      // Read Transactions CSV
      setProcessingStep("Reading Transactions file...")
      setProcessingProgress(10)
      const transactionsText = await readFileAsText(transactions)

      // Analyze CSV structure
      const transactionAnalysis = analyzeCSV(transactionsText, "transactions")
      setDebugInfo((prev) => ({
        ...prev,
        transactionsSample: transactionsText.substring(0, 500),
        transactionAnalysis,
      }))

      // Read Symbols CSV
      setProcessingStep("Reading Symbols file...")
      setProcessingProgress(30)
      const symbolsText = await readFileAsText(symbols)
      const symbolAnalysis = analyzeCSV(symbolsText, "symbols")
      setDebugInfo((prev) => ({
        ...prev,
        symbolsSample: symbolsText.substring(0, 500),
        symbolAnalysis,
      }))

      // Read Quotes CSV
      setProcessingStep("Reading Quotes file...")
      setProcessingProgress(50)
      const quotesText = await readFileAsText(quotes)
      const quoteAnalysis = analyzeCSV(quotesText, "quotes")
      setDebugInfo((prev) => ({
        ...prev,
        quotesSample: quotesText.substring(0, 500),
        quoteAnalysis,
      }))

      // Parse data
      setProcessingStep("Parsing data...")
      setProcessingProgress(70)

      // Process data in the parent component
      setProcessingStep("Calculating portfolio metrics...")
      setProcessingProgress(90)

      // Return the data to the parent component
      onFilesProcessed({
        transactions: transactionsText,
        symbols: symbolsText,
        quotes: quotesText,
      })

      setProcessingStep("Processing complete!")
      setProcessingProgress(100)

      // Reset processing state after a short delay
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep("")
      }, 1500)
    } catch (err) {
      console.error("Error processing files:", err)
      setError(`Error processing files: ${err instanceof Error ? err.message : String(err)}`)
      onError(`Error processing files: ${err instanceof Error ? err.message : String(err)}`)
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Portfolio Data</CardTitle>
        <CardDescription>Upload your portfolio data files to visualize your portfolio dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Required File Formats:</h3>
            <p className="text-xs text-muted-foreground">
              <strong>Transactions CSV:</strong> Date, Symbol, Type (Buy/Sell/Dividend), Qty, Price, Value, Account
              columns
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Symbols CSV:</strong> Symbol, Name, Sector columns
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Quotes CSV:</strong> Date, Symbol, Close, Change, QtyHeld columns (tab-separated)
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs font-medium">Transactions CSV</p>
                <input
                  type="file"
                  id="transactions"
                  className="sr-only"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, "transactions")}
                />
                <label
                  htmlFor="transactions"
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Browse
                </label>
                {transactions && (
                  <div className="flex items-center gap-1 text-xs">
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="truncate max-w-[120px]">{transactions.name}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs font-medium">Symbols CSV</p>
                <input
                  type="file"
                  id="symbols"
                  className="sr-only"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, "symbols")}
                />
                <label
                  htmlFor="symbols"
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Browse
                </label>
                {symbols && (
                  <div className="flex items-center gap-1 text-xs">
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="truncate max-w-[120px]">{symbols.name}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs font-medium">Quotes CSV</p>
                <input
                  type="file"
                  id="quotes"
                  className="sr-only"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, "quotes")}
                />
                <label
                  htmlFor="quotes"
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Browse
                </label>
                {quotes && (
                  <div className="flex items-center gap-1 text-xs">
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="truncate max-w-[120px]">{quotes.name}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{processingStep}</span>
                  <span className="text-sm">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} />
              </div>
            )}

            <Button
              onClick={processFiles}
              disabled={isProcessing || !transactions || !symbols || !quotes}
              className="w-full"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4 animate-pulse" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Process Portfolio Data
                </span>
              )}
            </Button>
          </div>
        </div>
        {props.debug && (
          <div className="mt-4 p-4 border rounded-md bg-muted">
            <h3 className="text-sm font-medium mb-2">Debug Information</h3>
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="mb-4">
                <h4 className="text-xs font-medium">{key}:</h4>
                <pre className="text-xs mt-1 p-2 bg-background rounded border overflow-x-auto">
                  {typeof value === "object" ? JSON.stringify(value, null, 2) : value || "No data"}
                </pre>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
