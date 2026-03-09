"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { addPaymentMethod, deletePaymentMethod } from "@/app/actions"

interface PaymentMethod {
  id: string
  name: string
}

export function PaymentsTable({ payments }: { payments: PaymentMethod[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsAdding(true)
    const formData = new FormData(e.currentTarget)
    const result = await addPaymentMethod(formData)

    if (result?.error) {
      toast.error("Failed to add payment method", { description: result.error })
    } else {
      toast.success("Payment method added successfully!")
      setIsOpen(false)
    }
    setIsAdding(false)
  }

  async function handleDelete(id: string, name: string) {
    setDeletingId(id)
    const result = await deletePaymentMethod(id)

    if (result?.error) {
      toast.error("Failed to delete payment method", { description: result.error })
    } else {
      toast.success(`Payment method "${name}" deleted.`)
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Master Payment Methods</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Payment Method
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Create a new payment method (e.g. Bank BCA, Gopay, Cash).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required placeholder="e.g. Bank BCA" disabled={isAdding} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Payment Method"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Method Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments && payments.length > 0 ? (
              payments.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="font-medium">{pay.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === pay.id}
                      onClick={() => handleDelete(pay.id, pay.name)}
                    >
                      {deletingId === pay.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><Trash2 className="mr-1 h-3.5 w-3.5" /> Delete</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No payment methods found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
