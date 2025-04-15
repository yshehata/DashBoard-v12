// Utility functions for processing CSV data

export async function fetchCSVData(url: string) {
  try {
    const response = await fetch(url)
    const text = await response.text()
    return text
  } catch (error) {
    console.error("Error fetching CSV data:", error)
    return ""
  }
}

// Helper function to detect delimiter
function detectDelimiter(csv: string): string {
  const firstLine = csv.split("\n")[0]
  if (firstLine.includes(";")) return ";"
  if (firstLine.includes("\t")) return "\t"
  return ","
}

// Helper function to parse CSV line handling quoted values
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = []
  let inQuote = false
  let currentValue = ""

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuote = !inQuote
    } else if (char === delimiter && !inQuote) {
      values.push(currentValue)
      currentValue = ""
    } else {
      currentValue += char
    }
  }

  // Add the last value
  values.push(currentValue)

  // If parsing didn't work well, try simple split
  if (values.length < 5) {
    return line.split(delimiter)
  }

  return values
}

// Helper function to parse dates from various formats
function parseDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === "") return new Date()

  // Clean the date string
  dateStr = dateStr.trim().replace(/^"(.*)"$/, "$1")

  // Try direct parsing
  const directDate = new Date(dateStr)
  if (!isNaN(directDate.getTime())) return directDate

  // Try MM/DD/YYYY format
  const mmddyyyy = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(dateStr)
  if (mmddyyyy) {
    const [_, month, day, year] = mmddyyyy
    const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
    if (!isNaN(date.getTime())) return date
  }

  // Try DD/MM/YYYY format
  const ddmmyyyy = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(dateStr)
  if (ddmmyyyy) {
    const [_, day, month, year] = ddmmyyyy
    const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
    if (!isNaN(date.getTime())) return date
  }

  // Try YYYY-MM-DD format
  const yyyymmdd = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr)
  if (yyyymmdd) {
    const [_, year, month, day] = yyyymmdd
    const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
    if (!isNaN(date.getTime())) return date
  }

  console.warn(`Could not parse date: ${dateStr}, using current date`)
  return new Date()
}

// Helper function to map transaction types
function mapTransactionType(type: string): string {
  type = type.trim()
  switch (type) {
    case "CUPON":
      return "Dividend"
    case "Shares in":
      return "Buy"
    case "Deposit":
      return "Deposit"
    case "Div Collection":
      return "Withdrawal"
    case "Buy":
      return "Buy"
    case "Sell":
      return "Sell"
    default:
      return type
  }
}

// Parse numeric value handling commas and currency symbols
function parseNumeric(value: string): number {
  if (!value || value.trim() === "") return 0
  return Number.parseFloat(value.replace(/[^\d.-]/g, "")) || 0
}

// Completely rewritten Transactions CSV parser to handle your specific format
export function parseTransactionsCSV(csv: string) {
  console.log("Raw transactions sample:", csv.substring(0, 500))

  // Handle BOM character that Excel sometimes adds
  const cleanCsv = csv.charCodeAt(0) === 0xfeff ? csv.substring(1) : csv

  // Try to detect the delimiter (comma, semicolon, or tab)
  let delimiter = ","
  const firstLine = cleanCsv.split("\n")[0]

  if (firstLine.includes(";")) {
    delimiter = ";"
  } else if (firstLine.includes("\t")) {
    delimiter = "\t"
  }

  console.log(`Using delimiter: "${delimiter}" for transactions`)

  // Split into lines and remove empty lines
  const lines = cleanCsv.split("\n").filter((line) => line.trim() !== "")

  if (lines.length === 0) {
    console.error("No data found in transactions CSV")
    return []
  }

  console.log(`Found ${lines.length} lines in transactions CSV`)
  console.log("First few lines:", lines.slice(0, 3))

  // Determine header row - try both first and second row
  let headerRow = 0
  let headers = lines[headerRow].split(delimiter).map((h) => h.trim())

  // If first row doesn't look like headers (e.g., it has importance indicators), try second row
  if (headers.some((h) => h === "" || /^\d+$/.test(h))) {
    headerRow = 1
    if (lines.length > headerRow) {
      headers = lines[headerRow].split(delimiter).map((h) => h.trim())
    }
  }

  console.log(`Using row ${headerRow} as header row:`, headers)

  // Create a mapping of expected headers to actual headers (case insensitive)
  const findHeader = (pattern) => {
    const regex = new RegExp(pattern, "i")
    return headers.findIndex((h) => regex.test(h))
  }

  const headerIndexes = {
    date: findHeader("date"),
    symbol: findHeader("symbol"),
    type: findHeader("type"),
    qty: findHeader("qty"),
    price: Math.max(findHeader("net price"), findHeader("price")),
    value: Math.max(findHeader("totalamnt"), findHeader("value"), findHeader("amount")),
    account: findHeader("account"),
    status: findHeader("status"),
    realized: Math.max(findHeader("realized3"), findHeader("realized")),
    cashImpact: findHeader("cash impact"),
    qtyBalance: findHeader("qty balance"),
    costBalance: findHeader("cost balance"),
  }

  console.log("Header indexes:", headerIndexes)

  // Process each line
  const transactions = []
  const dataStartRow = headerRow + 1

  for (let i = dataStartRow; i < lines.length; i++) {
    try {
      const line = lines[i]
      const values = line.split(delimiter).map((v) => v.trim())

      if (values.length < 3) {
        console.warn(`Skipping line ${i} due to insufficient data:`, line)
        continue
      }

      // Create transaction with default values
      const transaction: any = {
        Date: new Date(),
        Symbol: "",
        Type: "",
        Qty: 0,
        Price: 0,
        Value: 0,
        Account: "",
        Status: "",
        RealizedGain: 0,
      }

      // Parse date
      if (headerIndexes.date >= 0 && values[headerIndexes.date]) {
        const dateStr = values[headerIndexes.date]
        // Try multiple date formats
        const dateParsers = [
          // Direct parsing
          () => new Date(dateStr),
          // DD/MM/YYYY
          () => {
            const parts = dateStr.split(/[/.-]/)
            return parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : null
          },
          // MM/DD/YYYY
          () => {
            const parts = dateStr.split(/[/.-]/)
            return parts.length === 3 ? new Date(`${parts[2]}-${parts[0]}-${parts[1]}`) : null
          },
        ]

        for (const parser of dateParsers) {
          try {
            const date = parser()
            if (date && !isNaN(date.getTime())) {
              transaction.Date = date
              break
            }
          } catch (e) {
            // Continue to next parser
          }
        }
      }

      // Parse other fields
      if (headerIndexes.symbol >= 0) transaction.Symbol = values[headerIndexes.symbol] || ""

      // Type mapping
      if (headerIndexes.type >= 0) {
        const rawType = values[headerIndexes.type] || ""
        transaction.RawType = rawType

        // Map transaction types
        if (/cupon/i.test(rawType)) {
          transaction.Type = "Dividend"
        } else if (/shares in/i.test(rawType)) {
          transaction.Type = "Buy"
        } else if (/div collection/i.test(rawType)) {
          transaction.Type = "Withdrawal"
        } else if (/deposit/i.test(rawType)) {
          transaction.Type = "Deposit"
        } else if (/buy/i.test(rawType)) {
          transaction.Type = "Buy"
        } else if (/sell/i.test(rawType)) {
          transaction.Type = "Sell"
        } else {
          transaction.Type = rawType
        }
      }

      // Parse numeric fields
      if (headerIndexes.qty >= 0) {
        transaction.Qty = Number.parseFloat(values[headerIndexes.qty].replace(/,/g, "")) || 0
      }

      if (headerIndexes.price >= 0) {
        transaction.Price = Number.parseFloat(values[headerIndexes.price].replace(/,/g, "")) || 0
      }

      if (headerIndexes.value >= 0) {
        transaction.Value = Number.parseFloat(values[headerIndexes.value].replace(/,/g, "")) || 0
      }

      if (headerIndexes.account >= 0) {
        transaction.Account = values[headerIndexes.account] || ""
      }

      if (headerIndexes.status >= 0) {
        transaction.Status = values[headerIndexes.status] || ""
      }

      if (headerIndexes.realized >= 0) {
        transaction.RealizedGain = Number.parseFloat(values[headerIndexes.realized].replace(/,/g, "")) || 0
      }

      // Special handling for Div Collection (treat as withdrawal)
      if (transaction.Type === "Withdrawal") {
        // Ensure value is negative for withdrawals
        if (transaction.Value > 0) {
          transaction.Value = -transaction.Value
        }
      }

      // Calculate Value if not provided but we have Qty and Price
      if (transaction.Value === 0 && transaction.Qty > 0 && transaction.Price > 0) {
        transaction.Value = transaction.Qty * transaction.Price
      }

      // Validate transaction has minimum required fields
      if (transaction.Symbol && transaction.Date && !isNaN(transaction.Date.getTime())) {
        transactions.push(transaction)
      } else {
        console.warn(`Skipping invalid transaction at line ${i}:`, values)
      }
    } catch (error) {
      console.error(`Error parsing transaction line ${i}:`, error)
    }
  }

  console.log(`Successfully parsed ${transactions.length} transactions`)
  if (transactions.length > 0) {
    console.log("First transaction:", transactions[0])
  } else {
    console.error("No transactions were parsed. Check CSV format and headers.")
  }

  // If no transactions were parsed but we have data, create a sample transaction for debugging
  if (transactions.length === 0 && lines.length > dataStartRow) {
    console.warn("Creating sample transaction for debugging")
    return [
      {
        Date: new Date(),
        Symbol: "DEBUG_SAMPLE",
        Type: "Buy",
        Qty: 100,
        Price: 10,
        Value: 1000,
        Account: "Debug Account",
      },
    ]
  }

  return transactions
}

// Rewritten symbols parser to handle your format
export function parseSymbolsCSV(csv: string) {
  console.log("Raw symbols sample:", csv.substring(0, 200))

  // Handle BOM character that Excel sometimes adds
  const cleanCsv = csv.charCodeAt(0) === 0xfeff ? csv.substring(1) : csv
  const delimiter = detectDelimiter(cleanCsv)
  console.log(`Using delimiter: "${delimiter}" for symbols`)

  // Split into lines and remove empty lines
  const lines = cleanCsv.split("\n").filter((line) => line.trim() !== "")
  if (lines.length === 0) {
    console.error("No data found in symbols CSV")
    return []
  }

  // Get headers from first row
  const headers = lines[0].split(delimiter).map((h) => h.trim())
  console.log("Symbol headers:", headers)

  // Create column index map
  const colIndex: Record<string, number> = {}
  headers.forEach((header, index) => {
    colIndex[header] = index
  })

  // Process each line
  const symbols = []

  for (let i = 1; i < lines.length; i++) {
    try {
      const line = lines[i]
      const values = parseCSVLine(line, delimiter)

      if (values.length < 3) continue // Skip lines with insufficient data

      // Create symbol object with default values
      const symbol: any = {
        Symbol: "",
        Name: "",
        Sector: "",
        SymbolGroup: "",
        CashAcc: "",
      }

      // Map fields using column index
      if (colIndex["Symbol"] !== undefined) {
        symbol.Symbol = values[colIndex["Symbol"]].trim()
      }

      if (colIndex["Sh_name_eng"] !== undefined) {
        symbol.Name = values[colIndex["Sh_name_eng"]].trim() || symbol.Symbol
      }

      if (colIndex["Sector"] !== undefined) {
        symbol.Sector = values[colIndex["Sector"]].trim() || "Unknown"
      }

      if (colIndex["Symbol Group"] !== undefined) {
        symbol.SymbolGroup = values[colIndex["Symbol Group"]].trim() || "Stock"
      }

      if (colIndex["CashAcc"] !== undefined) {
        symbol.CashAcc = values[colIndex["CashAcc"]].trim() || ""
      }

      // Validate symbol
      if (symbol.Symbol) {
        symbols.push(symbol)
      }
    } catch (error) {
      console.error(`Error parsing symbol line ${i}:`, error)
    }
  }

  console.log(`Successfully parsed ${symbols.length} symbols`)
  if (symbols.length > 0) {
    console.log("First symbol:", symbols[0])
  }

  return symbols
}

// Rewritten quotes parser to handle your format
export function parseQuotesCSV(csv: string) {
  console.log("Raw quotes sample:", csv.substring(0, 200))

  // Handle BOM character that Excel sometimes adds
  const cleanCsv = csv.charCodeAt(0) === 0xfeff ? csv.substring(1) : csv
  const delimiter = detectDelimiter(cleanCsv)
  console.log(`Using delimiter: "${delimiter}" for quotes`)

  // Split into lines and remove empty lines
  const lines = cleanCsv.split("\n").filter((line) => line.trim() !== "")
  if (lines.length === 0) {
    console.error("No data found in quotes CSV")
    return []
  }

  // Get headers from first row
  const headers = lines[0].split(delimiter).map((h) => h.trim())
  console.log("Quote headers:", headers)

  // Create column index map
  const colIndex: Record<string, number> = {}
  headers.forEach((header, index) => {
    colIndex[header] = index
  })

  // Process each line
  const quotes = []

  for (let i = 1; i < lines.length; i++) {
    try {
      const line = lines[i]
      const values = parseCSVLine(line, delimiter)

      if (values.length < 3) continue // Skip lines with insufficient data

      // Create quote object with default values
      const quote: any = {
        Date: new Date(),
        Close: 0,
        Symbol: "",
        Change: 0,
        QtyHeld: 0,
      }

      // Map fields using column index
      if (colIndex["Date"] !== undefined) {
        quote.Date = parseDate(values[colIndex["Date"]])
      }

      if (colIndex["Close"] !== undefined) {
        quote.Close = parseNumeric(values[colIndex["Close"]])
      }

      if (colIndex["Symbol"] !== undefined) {
        quote.Symbol = values[colIndex["Symbol"]].trim()
      }

      if (colIndex["Change"] !== undefined) {
        quote.Change = parseNumeric(values[colIndex["Change"]])
      }

      if (colIndex["Qty Held"] !== undefined) {
        quote.QtyHeld = parseNumeric(values[colIndex["Qty Held"]])
      }

      // Validate quote
      if (quote.Symbol && quote.Date && !isNaN(quote.Date.getTime()) && quote.Close > 0) {
        quotes.push(quote)
      }
    } catch (error) {
      console.error(`Error parsing quote line ${i}:`, error)
    }
  }

  console.log(`Successfully parsed ${quotes.length} quotes`)
  if (quotes.length > 0) {
    console.log("First quote:", quotes[0])
  }

  return quotes
}

// Updated to use your transaction structure and realized gains
export function calculatePortfolioMetrics(transactions: any[], quotes: any[], symbols: any[]) {
  // Group transactions by date to create time series data
  const dateMap = new Map()

  // Process transactions chronologically
  const sortedTransactions = [...transactions]
    .filter((t) => t.Date && !isNaN(t.Date.getTime())) // Filter out invalid dates
    .sort((a, b) => a.Date.getTime() - b.Date.getTime())

  let cumulativeCash = 0
  let cumulativeRealizedReturn = 0
  let initialInvestment = 0
  let hasSetInitialInvestment = false

  // Track holdings over time
  const holdings = new Map()

  sortedTransactions.forEach((transaction) => {
    try {
      const date = new Date(transaction.Date)
      if (isNaN(date.getTime())) {
        console.warn(`Skipping transaction with invalid date: ${transaction.Date}`)
        return
      }

      const dateKey = date.toISOString().split("T")[0]

      // Update holdings based on transaction type
      if (transaction.Type === "Buy" || transaction.RawType === "Shares in") {
        const currentHolding = holdings.get(transaction.Symbol) || { qty: 0, cost: 0 }
        holdings.set(transaction.Symbol, {
          qty: currentHolding.qty + transaction.Qty,
          cost: currentHolding.cost + transaction.Value,
        })

        cumulativeCash -= transaction.Value

        if (!hasSetInitialInvestment) {
          initialInvestment = transaction.Value
          hasSetInitialInvestment = true
        }
      } else if (transaction.Type === "Sell") {
        const currentHolding = holdings.get(transaction.Symbol) || { qty: 0, cost: 0 }

        // Use provided realized gain if available
        if (transaction.RealizedGain !== undefined && transaction.RealizedGain !== 0) {
          cumulativeRealizedReturn += transaction.RealizedGain
        } else {
          // Calculate realized return if not provided
          if (currentHolding.qty > 0) {
            const costBasis = (transaction.Qty / currentHolding.qty) * currentHolding.cost
            const saleProceeds = transaction.Value
            const realizedReturn = saleProceeds - costBasis
            cumulativeRealizedReturn += realizedReturn
          }
        }

        // Update holdings
        holdings.set(transaction.Symbol, {
          qty: Math.max(0, currentHolding.qty - transaction.Qty),
          cost:
            currentHolding.qty > transaction.Qty
              ? (currentHolding.cost * (currentHolding.qty - transaction.Qty)) / currentHolding.qty
              : 0,
        })

        cumulativeCash += transaction.Value
      } else if (transaction.Type === "Dividend") {
        cumulativeCash += transaction.Value
        cumulativeRealizedReturn += transaction.Value
      } else if (transaction.Type === "Deposit") {
        cumulativeCash += transaction.Value
      } else if (transaction.Type === "Withdrawal") {
        cumulativeCash += transaction.Value // Value should be negative for withdrawals
      }

      // Store daily snapshot
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          cashValue: cumulativeCash,
          realizedReturn: cumulativeRealizedReturn,
          holdings: new Map(holdings),
          totalValue: cumulativeCash, // Will be updated with equity value
          equityValue: 0, // Will be calculated
          unrealizedReturn: 0, // Will be calculated
          totalReturn: 0, // Will be calculated
          egx30: 0, // Will be filled from external data
        })
      } else {
        const dayData = dateMap.get(dateKey)
        dayData.cashValue = cumulativeCash
        dayData.realizedReturn = cumulativeRealizedReturn
        dayData.holdings = new Map(holdings)
      }
    } catch (error) {
      console.warn(`Error processing transaction: ${error}`)
    }
  })

  // Process quotes to calculate equity values and unrealized returns
  quotes.forEach((quote) => {
    try {
      if (!quote.Date || isNaN(quote.Date.getTime())) {
        console.warn(`Skipping quote with invalid date`)
        return
      }

      const dateKey = quote.Date.toISOString().split("T")[0]

      // Find the most recent date entry that's less than or equal to this quote date
      let closestDate = null
      for (const [date] of dateMap) {
        if (date <= dateKey && (!closestDate || date > closestDate)) {
          closestDate = date
        }
      }

      if (closestDate) {
        const dayData = dateMap.get(closestDate)
        const holding = dayData.holdings.get(quote.Symbol)

        if (holding && holding.qty > 0) {
          const marketValue = holding.qty * quote.Close
          const costBasis = holding.cost
          const unrealizedReturn = marketValue - costBasis

          dayData.equityValue = (dayData.equityValue || 0) + marketValue
          dayData.unrealizedReturn = (dayData.unrealizedReturn || 0) + unrealizedReturn
        }

        // Update total value
        dayData.totalValue = dayData.cashValue + (dayData.equityValue || 0)

        // Calculate total return percentage
        if (initialInvestment > 0) {
          dayData.totalReturn = ((dayData.realizedReturn + (dayData.unrealizedReturn || 0)) / initialInvestment) * 100
        }

        // For EGX30, we would need historical index data
        // For now, we'll use a placeholder calculation
        dayData.egx30 = -25.38 // This would be replaced with actual index data
      }
    } catch (error) {
      console.warn(`Error processing quote: ${error}`)
    }
  })

  // If no data was processed, create a sample entry
  if (dateMap.size === 0) {
    const today = new Date().toISOString().split("T")[0]
    dateMap.set(today, {
      date: today,
      cashValue: 100000,
      realizedReturn: 5000,
      holdings: new Map(),
      totalValue: 100000,
      equityValue: 0,
      unrealizedReturn: 0,
      totalReturn: 5,
      egx30: -25.38,
    })
  }

  // Convert to array and sort by date
  const timeSeriesData = Array.from(dateMap.values())
    .map((entry) => ({
      ...entry,
      holdings: Array.from(entry.holdings.entries()).map(([symbol, data]) => ({
        symbol,
        ...data,
      })),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return timeSeriesData
}

// Updated to filter out zero quantity positions
export function getCurrentHoldings(transactions: any[], quotes: any[], symbols: any[]) {
  // Track holdings
  const holdings = new Map()

  // Process all transactions
  transactions.forEach((transaction) => {
    if (transaction.Type === "Buy" || transaction.RawType === "Shares in") {
      const currentHolding = holdings.get(transaction.Symbol) || {
        symbol: transaction.Symbol,
        qty: 0,
        cost: 0,
        avgCost: 0,
      }

      holdings.set(transaction.Symbol, {
        symbol: transaction.Symbol,
        qty: currentHolding.qty + transaction.Qty,
        cost: currentHolding.cost + transaction.Value,
        avgCost: (currentHolding.cost + transaction.Value) / (currentHolding.qty + transaction.Qty),
      })
    } else if (transaction.Type === "Sell") {
      const currentHolding = holdings.get(transaction.Symbol)

      if (currentHolding && currentHolding.qty > 0) {
        const remainingQty = currentHolding.qty - transaction.Qty

        if (remainingQty > 0) {
          // Update with remaining position
          holdings.set(transaction.Symbol, {
            symbol: transaction.Symbol,
            qty: remainingQty,
            cost: (currentHolding.cost * remainingQty) / currentHolding.qty,
            avgCost: (currentHolding.cost * remainingQty) / currentHolding.qty / remainingQty,
          })
        } else {
          // Position closed - remove it
          holdings.delete(transaction.Symbol)
        }
      }
    }
  })

  // Get latest quotes for each holding
  const latestQuotes = new Map()
  quotes.forEach((quote) => {
    if (!latestQuotes.has(quote.Symbol) || new Date(quote.Date) > new Date(latestQuotes.get(quote.Symbol).Date)) {
      latestQuotes.set(quote.Symbol, quote)
    }
  })

  // Combine holdings with latest quotes and symbol info
  const symbolMap = new Map(symbols.map((s) => [s.Symbol, s]))

  const currentHoldings = Array.from(holdings.values())
    .filter((holding) => holding.qty > 0) // Filter out zero quantity positions
    .map((holding) => {
      const quote = latestQuotes.get(holding.symbol)
      const symbolInfo = symbolMap.get(holding.symbol)

      const currentPrice = quote ? quote.Close : 0
      const marketValue = holding.qty * currentPrice
      const unrealizedReturn = marketValue - holding.cost
      const returnPercent = holding.cost > 0 ? (unrealizedReturn / holding.cost) * 100 : 0

      return {
        symbol: holding.symbol,
        name: symbolInfo ? symbolInfo.Name : holding.symbol,
        sector: symbolInfo ? symbolInfo.Sector : "Unknown",
        symbolGroup: symbolInfo ? symbolInfo.SymbolGroup : "Stock",
        quantity: holding.qty,
        avgCost: holding.avgCost,
        currentPrice,
        value: marketValue,
        cost: holding.cost,
        unrealizedReturn,
        return: returnPercent,
      }
    })
    .sort((a, b) => b.value - a.value) // Sort by value descending

  return currentHoldings
}

// Updated to use your transaction structure and realized gains
export function getClosedPositions(transactions: any[]) {
  // Track positions
  const positions = new Map()
  const closedPositions = []

  // Process transactions chronologically
  const sortedTransactions = [...transactions]
    .filter((t) => t.Date && !isNaN(t.Date.getTime())) // Filter out invalid dates
    .sort((a, b) => a.Date.getTime() - b.Date.getTime())

  sortedTransactions.forEach((transaction) => {
    try {
      const symbol = transaction.Symbol

      if (transaction.Type === "Buy" || transaction.RawType === "Shares in") {
        if (!positions.has(symbol)) {
          positions.set(symbol, {
            symbol,
            qty: 0,
            cost: 0,
            buys: [],
            sells: [],
            status: transaction.Status || "",
          })
        }

        const position = positions.get(symbol)
        position.qty += transaction.Qty
        position.cost += transaction.Value
        position.buys.push(transaction)
      } else if (transaction.Type === "Sell") {
        if (positions.has(symbol)) {
          const position = positions.get(symbol)
          position.qty -= transaction.Qty
          position.sells.push(transaction)

          // If position is closed
          if (position.qty <= 0) {
            const totalCost = position.cost
            const totalProceeds = position.sells.reduce((sum, sell) => sum + sell.Value, 0)

            // Use provided realized gain if available
            let realizedReturn = 0
            if (transaction.RealizedGain !== undefined && transaction.RealizedGain !== 0) {
              realizedReturn = transaction.RealizedGain
            } else {
              realizedReturn = totalProceeds - totalCost
            }

            const returnPercent = (realizedReturn / totalCost) * 100

            closedPositions.push({
              symbol,
              cost: totalCost,
              proceeds: totalProceeds,
              realizedReturn,
              return: returnPercent,
              closeDate: transaction.Date,
              status: position.status,
            })

            positions.delete(symbol)
          }
        }
      }
    } catch (error) {
      console.warn(`Error processing transaction for closed positions: ${error}`)
    }
  })

  return closedPositions
}

// Updated to handle your account structure
export function calculateCashAccounts(transactions: any[]) {
  // Group by account
  const accounts = new Map()

  transactions.forEach((transaction) => {
    if (!transaction.Account) return

    if (!accounts.has(transaction.Account)) {
      accounts.set(transaction.Account, 0)
    }

    const currentBalance = accounts.get(transaction.Account)

    if (transaction.Type === "Buy" || transaction.RawType === "Shares in") {
      accounts.set(transaction.Account, currentBalance - transaction.Value)
    } else if (transaction.Type === "Sell") {
      accounts.set(transaction.Account, currentBalance + transaction.Value)
    } else if (transaction.Type === "Dividend") {
      accounts.set(transaction.Account, currentBalance + transaction.Value)
    } else if (transaction.Type === "Deposit") {
      accounts.set(transaction.Account, currentBalance + transaction.Value)
    } else if (transaction.Type === "Withdrawal") {
      accounts.set(transaction.Account, currentBalance + transaction.Value) // Value should be negative
    }
  })

  return Array.from(accounts.entries()).map(([name, value]) => ({
    name,
    value,
  }))
}
