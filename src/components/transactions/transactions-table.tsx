"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { addTransaction, deleteTransaction } from "@/app/actions"

interface Transaction {
  id: string
  amount: number
  description: string
  transaction_type: string
  transaction_date: string
  created_by_name: string
  master_categories: any
  master_payment_methods: any
}

interface Category {
  id: string
  name: string
  type: string
}

interface PaymentMethod {
  id: string
  name: string
}

const ITEMS_PER_PAGE = 15

type TabType = "all" | "pemasukan" | "pengeluaran"

export function TransactionsTable({
  transactions,
  categories,
  payments,
  dateFilter,
  userRole = "viewer",
}: {
  transactions: Transaction[]
  categories: Category[]
  payments: PaymentMethod[]
  dateFilter?: React.ReactNode
  userRole?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedPaymentId, setSelectedPaymentId] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Build lookup maps: name → id
  const categoryNameToId = useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach((c) => { map[c.name] = c.id })
    return map
  }, [categories])

  const paymentNameToId = useMemo(() => {
    const map: Record<string, string> = {}
    payments.forEach((p) => { map[p.name] = p.id })
    return map
  }, [payments])

  // Filter transactions by tab
  const filteredTransactions = useMemo(() => {
    if (activeTab === "all") return transactions
    return transactions.filter((tx) => tx.transaction_type === activeTab)
  }, [transactions, activeTab])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTransactions, currentPage])

  // Reset page when tab changes
  function handleTabChange(tab: TabType) {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsAdding(true)
    const formData = new FormData(e.currentTarget)
    const result = await addTransaction(formData)

    if (result?.error) {
      toast.error("Failed to add transaction", { description: result.error })
    } else {
      toast.success("Transaction added successfully!")
      setIsOpen(false)
    }
    setIsAdding(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteTransaction(id)
    if (result?.error) {
      toast.error("Failed to delete", { description: result.error })
    } else {
      toast.success("Transaction deleted.")
    }
    setDeletingId(null)
  }

  const isSuperadmin = userRole === "superadmin"

  // Tab counts
  const allCount = transactions.length
  const incomeCount = transactions.filter((t) => t.transaction_type === "pemasukan").length
  const expenseCount = transactions.filter((t) => t.transaction_type === "pengeluaran").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Transaction</SheetTitle>
              <SheetDescription>Fill in the details to record a new transaction.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4 px-4">
                <div className="grid gap-2">
                  <Label htmlFor="transaction_type">Type</Label>
                  <Select name="transaction_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pemasukan">Pemasukan</SelectItem>
                      <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" required disabled={isAdding} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" disabled={isAdding} placeholder="Keterangan" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category_id">Category</Label>
                  <input type="hidden" name="category_id" value={selectedCategoryId} />
                  <Select
                    onValueChange={(v) => setSelectedCategoryId(categoryNameToId[v as string] || "")}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment_method_id">Payment Method</Label>
                  <input type="hidden" name="payment_method_id" value={selectedPaymentId} />
                  <Select
                    onValueChange={(v) => setSelectedPaymentId(paymentNameToId[v as string] || "")}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment" />
                    </SelectTrigger>
                    <SelectContent>
                      {payments.map((pay) => (
                        <SelectItem key={pay.id} value={pay.name}>
                          {pay.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transaction_date">Date</Label>
                  <Input
                    id="transaction_date"
                    name="transaction_date"
                    type="date"
                    disabled={isAdding}
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <SheetFooter className="px-4">
                <Button type="submit" disabled={isAdding} className="w-full">
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                    </>
                  ) : (
                    "Add Transaction"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Date Range Filter */}
      {dateFilter}

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => handleTabChange("all")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({allCount})
        </button>
        <button
          onClick={() => handleTabChange("pemasukan")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "pemasukan"
              ? "bg-emerald-500/10 text-emerald-500 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Income ({incomeCount})
        </button>
        <button
          onClick={() => handleTabChange("pengeluaran")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "pengeluaran"
              ? "bg-rose-500/10 text-rose-500 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Expense ({expenseCount})
        </button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {isSuperadmin && <TableHead className="text-right w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-xs whitespace-nowrap">
                    {new Date(tx.transaction_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-sm">{tx.description || "-"}</TableCell>
                  <TableCell className="text-sm">{tx.master_categories?.name || "-"}</TableCell>
                  <TableCell className="text-sm">{tx.master_payment_methods?.name || "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tx.created_by_name || "-"}</TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm ${tx.transaction_type === "pemasukan" ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {tx.transaction_type === "pemasukan" ? "+" : "-"}Rp{" "}
                    {Number(tx.amount).toLocaleString("id-ID")}
                  </TableCell>
                  {isSuperadmin && (
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger
                          className="inline-flex items-center justify-center h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          disabled={deletingId === tx.id}
                        >
                          {deletingId === tx.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Transaksi <strong>&quot;{tx.description || 'Tanpa keterangan'}&quot;</strong> sebesar{" "}
                              <strong>Rp {Number(tx.amount).toLocaleString("id-ID")}</strong> akan dihapus permanen. Aksi ini tidak bisa dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => handleDelete(tx.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isSuperadmin ? 7 : 6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
