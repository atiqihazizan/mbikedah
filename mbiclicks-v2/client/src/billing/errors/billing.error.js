export const ERROR_CODE = {
  NOT_FOUND:  'NOT_FOUND',
  FORBIDDEN:  'FORBIDDEN',
  VALIDATION: 'VALIDATION',
  SERVER:     'SERVER',
  NETWORK:    'NETWORK',
  UNKNOWN:    'UNKNOWN',
}

export class BillingError extends Error {
  constructor(message, { code = ERROR_CODE.UNKNOWN, status = null, original = null } = {}) {
    super(message)
    this.name    = 'BillingError'
    this.code    = code
    this.status  = status
    this.original = original
  }
}

export function fromAxiosError(err) {
  if (err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
    const abortErr = new BillingError('Permintaan dibatalkan.', { code: 'ABORTED' })
    abortErr.isAbort = true
    return abortErr
  }

  const status = err?.response?.status
  const msg    = err?.response?.data?.message ?? err?.message ?? 'Ralat tidak diketahui.'

  if (status === 404) return new BillingError('Permohonan tidak dijumpai.',         { code: ERROR_CODE.NOT_FOUND,  status })
  if (status === 403) return new BillingError('Anda tidak mempunyai kebenaran.',    { code: ERROR_CODE.FORBIDDEN,  status })
  if (status === 422) return new BillingError(msg,                                  { code: ERROR_CODE.VALIDATION, status })
  if (status >= 500)  return new BillingError('Ralat pelayan. Cuba sebentar lagi.', { code: ERROR_CODE.SERVER,     status })
  if (!err?.response) return new BillingError('Tiada sambungan. Semak rangkaian.',  { code: ERROR_CODE.NETWORK,    original: err })

  return new BillingError(msg, { code: ERROR_CODE.UNKNOWN, status, original: err })
}
