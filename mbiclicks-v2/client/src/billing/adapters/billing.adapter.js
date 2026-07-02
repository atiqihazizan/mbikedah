// Insulate React/ViewModel layer from backend response shape changes.
// If the API response structure changes, only this file needs updating.

export const BillingAdapter = {
  // GET /billings/:id → { billing, workflow, payments, approvalHistory }
  normalizeBilling(raw) {
    return {
      billing:         raw?.billing         ?? null,
      workflow:        raw?.workflow         ?? null,
      payments:        raw?.payments         ?? [],
      approvalHistory: raw?.approvalHistory  ?? [],
    }
  },

  // GET /billings, /billings/aktif, /billings/sejarah → { items, total, page, totalPages }
  normalizeList(raw) {
    return {
      items:      raw?.items      ?? raw?.data ?? [],
      total:      raw?.total      ?? 0,
      page:       raw?.page       ?? 1,
      totalPages: raw?.totalPages ?? 1,
    }
  },

  // GET /me/tasks → { summary, items }
  normalizeTasks(raw) {
    return {
      summary: {
        totalPending: raw?.summary?.totalPending ?? 0,
        urgent:       raw?.summary?.urgent       ?? 0,
        high:         raw?.summary?.high         ?? 0,
      },
      items: raw?.items ?? [],
    }
  },

  // GET /billings/:id/review → review modal shape (unchanged — legacy path)
  normalizeReview(raw) {
    return raw ?? {}
  },
}
