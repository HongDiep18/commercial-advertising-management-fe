"use client"

import { useState } from "react"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import type { PropertyRow } from "../property/types"
import { PropertyTableCard } from "../property/PropertyTableCard"
import { PropertyDeleteDialog } from "../property/PropertyDeleteDialog"
import { PropertyDetailDialog } from "../property/PropertyDetailDialog"
import { PropertyUpsertDialog } from "../property/PropertyUpsertDialog"

export function PropertyTab() {
  // --- Cross-component coordination state ---
  const [detailPropertyId, setDetailPropertyId] = useState<string | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<PropertyRow | null>(null)
  const [upsertMode, setUpsertMode] = useState<"create" | "edit" | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const handleCloseUpsertDialog = () => {
    setUpsertMode(null)
    setSelectedPropertyId(null)
  }

  return (
    <div className="space-y-6">
      <PropertyTableCard
        onView={(row) => setDetailPropertyId(row.id)}
        onEdit={(row) => {
          setSelectedPropertyId(row.id)
          setUpsertMode("edit")
        }}
        onDelete={setDeleteCandidate}
        onAdd={() => {
          setSelectedPropertyId(null)
          setUpsertMode("create")
        }}
        onShowToast={showToast}
      />

      <PropertyDetailDialog
        propertyId={detailPropertyId}
        open={Boolean(detailPropertyId)}
        onClose={() => setDetailPropertyId(null)}
      />

      <PropertyUpsertDialog
        open={upsertMode !== null}
        mode={upsertMode === "edit" ? "edit" : "create"}
        propertyId={selectedPropertyId}
        onClose={handleCloseUpsertDialog}
        onSuccess={(message) => showToast(message, "success")}
      />

      <PropertyDeleteDialog
        candidate={deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onSuccess={(message) => showToast(message, "success")}
        onError={(message) => showToast(message, "error")}
      />

      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={4500}
      />
    </div>
  )
}
