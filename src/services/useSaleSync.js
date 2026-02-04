/**
 * Hook personnalisé pour gérer la synchronisation automatique des ventes
 * Resynchronise les ventes en attente au démarrage de l'app
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import { salePersistenceService } from './salePersistenceService';

export function useSaleSync(user, onSyncComplete) {
  const syncInProgressRef = useRef(false);

  const processPendingSales = useCallback(async () => {
    if (!user || syncInProgressRef.current) {
      console.log('⏭️ Synchronisation sautée: pas d\'utilisateur ou sync déjà en cours');
      return;
    }

    syncInProgressRef.current = true;
    salePersistenceService.setSyncStatus({ syncing: true });

    try {
      const pendingSales = salePersistenceService.getPendingSalesToRetry();

      if (pendingSales.length === 0) {
        console.log('✅ Aucune vente à synchroniser');
        salePersistenceService.setSyncStatus({ syncing: false, lastSync: new Date().toISOString() });
        return;
      }

      console.log(`📤 Synchronisation de ${pendingSales.length} vente(s) en attente...`);

      let successCount = 0;
      let failureCount = 0;

      for (const sale of pendingSales) {
        try {
          console.log(`🔄 Synchronisation vente ${sale.id}...`);

          // Marquer comme "syncing"
          salePersistenceService.getPendingSales();
          const pending = salePersistenceService.getPendingSales();
          const pendingIndex = pending.findIndex(s => s.id === sale.id);
          if (pendingIndex !== -1) {
            pending[pendingIndex].status = 'syncing';
            localStorage.setItem('pending_sales_queue', JSON.stringify(pending));
          }

          // Appeler la fonction RPC
          const { data, error: rpcError } = await supabase.rpc('process_sale', {
            p_product_id: sale.product_id,
            p_quantity: sale.quantity,
            p_product_name: sale.product_name,
            p_sale_price: sale.sale_price,
            p_cost_price: sale.cost_price,
          });

          if (rpcError) {
            console.error('❌ Erreur RPC pour vente', sale.id, ':', rpcError);
            salePersistenceService.markAsFailed(sale.id, rpcError);
            failureCount++;
            continue;
          }

          if (data && !data.success) {
            const error = new Error(data.error || 'Erreur RPC');
            console.error('❌ RPC retourné false:', data.error);
            salePersistenceService.markAsFailed(sale.id, error);
            failureCount++;
            continue;
          }

          console.log('✅ Vente synchronisée avec succès:', sale.id);
          salePersistenceService.markAsSynced(sale.id);
          successCount++;
        } catch (err) {
          console.error('❌ Erreur traitement vente', sale.id, ':', err);
          salePersistenceService.markAsFailed(sale.id, err);
          failureCount++;
        }
      }

      console.log(`📊 Synchronisation terminée: ${successCount} OK, ${failureCount} erreurs`);
      salePersistenceService.setSyncStatus({
        syncing: false,
        lastSync: new Date().toISOString(),
        lastResult: { successCount, failureCount },
      });

      // Nettoyer les ventes complétées
      salePersistenceService.cleanupCompletedSales();

      // Callback pour notifier le parent
      if (onSyncComplete) {
        onSyncComplete({ successCount, failureCount });
      }
    } catch (err) {
      console.error('❌ Erreur grave lors de la synchronisation:', err);
      salePersistenceService.setSyncStatus({ syncing: false, lastError: err.message });
    } finally {
      syncInProgressRef.current = false;
    }
  }, [user, onSyncComplete]);

  // Synchroniser au démarrage et quand l'utilisateur se reconnecte
  useEffect(() => {
    if (!user) return;

    // Attendre un peu pour que l'app soit stable
    const timer = setTimeout(() => {
      processPendingSales();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, processPendingSales]);

  // Synchroniser régulièrement (chaque 30 secondes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const stats = salePersistenceService.getQueueStats();
      if (stats.pending > 0 || stats.failed > 0) {
        console.log('🔄 Tentative de synchronisation périodique...');
        processPendingSales();
      }
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [user, processPendingSales]);

  return {
    processPendingSales,
    getQueueStats: salePersistenceService.getQueueStats.bind(salePersistenceService),
    getSyncStatus: salePersistenceService.getSyncStatus.bind(salePersistenceService),
  };
}
