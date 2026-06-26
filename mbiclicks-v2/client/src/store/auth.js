import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken })
      },

      updateToken: (accessToken) => {
        set({ accessToken })
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null })
      },

      can: (module, action = 'canView') => {
        const perms = get().user?.role?.permissions ?? []
        const perm = perms.find((p) => p.module === module)
        return perm?.[action] ?? false
      },

      hasRole: (...slugs) => {
        const slug = get().user?.role?.slug
        return slug ? slugs.includes(slug) : false
      },

      canDraftCircular: () => {
        const u = get().user
        if (!u) return false
        const perms = u.role?.permissions ?? []
        const hasPerm = perms.find((p) => p.module === 'circular')
        return !!(hasPerm?.canCreate || u.canDraftCircular)
      },
    }),
    { name: 'mbi-auth' }
  )
)
