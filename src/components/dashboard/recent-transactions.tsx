"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface RecentTransaction {
  id: string
  amount: number
  description: string
  transaction_type: string
  transaction_date: string
  category_name: string
}

export function RecentTransactions({ transactions }: { transactions: RecentTransaction[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        No recent transactions.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-medium text-xs">
              {new Date(tx.transaction_date).toLocaleDateString("id-ID")}
            </TableCell>
            <TableCell className="text-sm">{tx.description || "-"}</TableCell>
            <TableCell className="text-sm">{tx.category_name || "-"}</TableCell>
            <TableCell className={`text-right font-mono text-sm ${tx.transaction_type === 'pemasukan' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {tx.transaction_type === 'pemasukan' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString("id-ID")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
