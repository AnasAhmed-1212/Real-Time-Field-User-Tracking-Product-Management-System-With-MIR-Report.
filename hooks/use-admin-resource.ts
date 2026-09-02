"use client"

import { useCallback, useEffect, useState } from 'react'

import { adminApi } from '@/lib/admin-api'

export function useAdminResource<T>(path: string, initialValue: T, refreshMs = 0) {
  const [data, setData] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setError('')
      setData(await adminApi<T>(path))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load data.')
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    const initial = window.setTimeout(() => refresh().catch(() => undefined), 0)
    if (!refreshMs) return () => window.clearTimeout(initial)
    const timer = window.setInterval(() => refresh().catch(() => undefined), refreshMs)
    return () => { window.clearTimeout(initial); window.clearInterval(timer) }
  }, [refresh, refreshMs])

  return { data, setData, loading, error, refresh }
}
