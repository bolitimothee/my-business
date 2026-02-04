/**
 * Hook personnalisé pour gérer la synchronisation automatique des ventes
 * Resynchronise les ventes en attente au démarrage de l'app
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import { salePersistenceService } from './salePersistenceService';

export function useSaleSync(user, onSyncComplete) {
  const syncInProgressRef = useRef(false);
  const lastSyncTimeRef = useRef(0);
  const MIN_SYNC_INTERVAL = 5000; // Min 5s entre les syncs

  const processPendingSales = useCallback(async () => {
    // Vérifications de précondition
    if (!user || syncInProgressRef.current) {
      return;
    }

    // Éviter les syncs trop rapides (debounce)
    const now = Date.now();
    if (now - lastSyncTimeRef.current < MIN_SYNC_INTERVAL) {
      return;
    }
    lastSyncTimeRef.current = now;

    syncInProgressRef.current = true;
    salePersistenceService.setSyncStatus({ syncing: true });

    try {
      const pendingSales = salePersistenceService.getPendingSalesToRetry();

      if (pendingSales.length === 0) {
        salePersistenceService.setSyncStatus({
          syncing: false,
          lastSync: new Date().toISOString(),
        });
        return;
      }

      console.log(`📤 Synchronisation de ${pendingSales.length} vente(s)...`);

      let successCount = 0;
      let failureCount = 0;

      for (const sale of pendingSales) {
        try {
          // Mettre à jour le statut avant d'envoyer
          salePersistenceService.markAssyncing(sale.id);

          // Appeler la fonction RPC
          const { data, error: rpcError } = await supabase.rpc('process_sale', {
            p_product_id: sale.product_id,
            p_quantity: sale.quantity,
            p_product_name: sale.product_name,
            p_sale_price: sale.sale_price,
            p_cost_price: sale.cost_price,
          });

          if (rpcError || (data && !data.success)) {
            const errorMsg = rpcError?.message || data?.error || 'Erreur inconnue';
            console.warn(`⚠️ Erreur vente ${sale.id}: ${errorMsg}`);
            salePersistenceService.markAsFailed(sale.id, new Error(errorMsg));
            failureCount++;
            continue;
          }

          console.log(`✅ Vente ${sale.id} synchronisée`);
          salePersistenceService.markAsSynced(sale.id);
          successCount++;
        } catch (err) {
          console.error(`❌ Erreur traitement ${sale.id}:`, err?.message);
          salePersistenceService.markAsFailed(sale.id, err);
          failureCount++;
        }
      }

      console.log(`✨ Sync terminée: ${successCount} OK, ${failureCount} erreurs`);
      salePersistenceService.setSyncStatus({
        syncing: false,
        lastSync: new Date().toISOString(),
        lastResult: { successCount, failureCount },
      });

      // Nettoyer les ventes complétées
      salePersistenceService.cleanupCompletedSales();

      // Notifier le parent
      if (onSyncComplete) {
        onSyncComplete({ successCount, failureCount });
      }
    } catch (err) {
      console.error('❌ Erreur synchronisation:', err?.message);
      salePersistenceService.setSyncStatus({
        syncing: false,
        lastError: err?.message,
      });
    } finally {
      syncInProgressRef.current = false;
    }
  }, [user, onSyncComplete]);

  // Synchroniser au démarrage
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      processPendingSales();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, processPendingSales]);

  // Synchroniser régulièrement (30 secondes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const stats = salePersistenceService.getQueueStats();
      if (stats.pending > 0 || stats.failed > 0) {
        processPendingSales();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, processPendingSales]);

  return {
    processPendingSales,
    getQueueStats: salePersistenceService.getQueueStats.bind(salePersistenceService),
    getSyncStatus: salePersistenceService.getSyncStatus.bind(salePersistenceService),
  };
}
