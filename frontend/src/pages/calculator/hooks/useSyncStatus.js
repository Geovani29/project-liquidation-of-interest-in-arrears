import { useState, useEffect, useCallback } from 'react'
import { calculationsService } from '../../../services/calculations'

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, synced, error, offline

  // Actualizar estado de sincronización
  const updateSyncStatus = useCallback(() => {
    const status = calculationsService.getStatus()
    if (!status.hasUser) {
      setSyncStatus('idle')
    } else if (!status.isOnline) {
      setSyncStatus('offline')
    } else if (status.canSync) {
      setSyncStatus('synced')
    } else {
      setSyncStatus('error')
    }
  }, [])

  // Monitorear cambios de conectividad
  useEffect(() => {
    // Actualizar estado inicial
    updateSyncStatus()

    // Escuchar cambios de conectividad
    const handleOnline = () => updateSyncStatus()
    const handleOffline = () => updateSyncStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Actualizar estado cada 30 segundos
    const interval = setInterval(updateSyncStatus, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [updateSyncStatus])

  return {
    syncStatus,
    updateSyncStatus
  }
}
