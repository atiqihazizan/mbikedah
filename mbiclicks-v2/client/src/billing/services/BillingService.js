// ADR-010: Pages/components import BillingService, never billingApi directly.
// ADR-013: Single entry point — all HTTP, error handling, abort, and adapter calls live here.
// ADR-015: One Source One Responsibility — BillingService owns transport + normalization.

import { billingApi, vendorApi } from '@/lib/billing'
import { BillingAdapter }        from '../adapters/billing.adapter.js'
import { fromAxiosError }        from '../errors/billing.error.js'

function wrap(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (err) {
      throw fromAxiosError(err)
    }
  }
}

export const BillingService = {
  // ─── Queries ────────────────────────────────────────────────────────────────

  get: wrap(async (id, { signal } = {}) => {
    const raw = await billingApi.get(id, { signal })
    return BillingAdapter.normalizeBilling(raw)
  }),

  list: wrap(async (params, { signal } = {}) => {
    const raw = await billingApi.list(params, { signal })
    return BillingAdapter.normalizeList(raw)
  }),

  listAktif: wrap(async (params, { signal } = {}) => {
    const raw = await billingApi.listAktif(params, { signal })
    return BillingAdapter.normalizeList(raw)
  }),

  listSejarah: wrap(async (params, { signal } = {}) => {
    const raw = await billingApi.listSejarah(params, { signal })
    return BillingAdapter.normalizeList(raw)
  }),

  getReview: wrap(async (id, { signal } = {}) => {
    const raw = await billingApi.getReview(id, { signal })
    return BillingAdapter.normalizeReview(raw)
  }),

  // Legacy review endpoints (Sprint 4 — HOD, CEO pages)
  hodReview: wrap(async (id, { signal } = {}) => {
    const raw = await billingApi.hodReview(id, { signal })
    return BillingAdapter.normalizeReview(raw)
  }),

  ceoReview: wrap(async (id, { signal } = {}) => {
    const raw = await billingApi.ceoReview(id, { signal })
    return BillingAdapter.normalizeReview(raw)
  }),

  // ─── Mutations ──────────────────────────────────────────────────────────────

  create: wrap((body)            => billingApi.create(body)),
  update: wrap((id, body)        => billingApi.update(id, body)),
  delete: wrap((id)              => billingApi.delete(id)),
  submit: wrap((id)              => billingApi.submit(id, {})),
  action: wrap((id, action, body) => billingApi.action(id, action, body)),
  pay:    wrap((id, body)        => billingApi.pay(id, body)),
  payPhase: wrap((id, phaseId, body) => billingApi.payPhase(id, phaseId, body)),
  close:  wrap((id, body)        => billingApi.close(id, body)),

  // Attachments
  uploadAtt:  wrap((id, file)          => billingApi.uploadAtt(id, file)),
  deleteAtt:  wrap((id, attId)         => billingApi.deleteAtt(id, attId)),
  downloadUrl: (id, attId)             => billingApi.downloadUrl(id, attId),

  // ─── Vendor (co-located in billing context) ─────────────────────────────────
  listVendors: wrap((params, { signal } = {}) => vendorApi.list(params, { signal })),
  createVendor: wrap((body)  => vendorApi.create(body)),
  updateVendor: wrap((id, body) => vendorApi.update(id, body)),
}
