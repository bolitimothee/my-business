/**
 * Service de persistence pour les ventes
 * Sauvegarde les ventes en attente dans localStorage pour éviter la perte de données
 * lors du rafraîchissement de la page ou de la déconnexion
 */

const PENDING_SALES_KEY = 'pending_sales_queue';
const SYNC_STATUS_KEY = 'sales_sync_status';

export const salePersistenceService = {
  /**
   * Ajouter une vente à la file d'attente (avant d'envoyer à Supabase)
   */
  addPendingSale(saleData) {
    try {
      const pending = this.getPendingSales();
      const saleWithId = {
        ...saleData,
        id: Date.now().toString(), // ID temporaire
        createdAt: new Date().toISOString(),
        status: 'pending', // pending, syncing, failed, completed
        retryCount: 0,
      };
      pending.push(saleWithId);
      localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(pending));
      console.log('💾 Vente sauvegardée localement:', saleWithId.id);
      return saleWithId.id;
    } catch (err) {
      console.error('❌ Erreur sauvegarde locale:', err);
      return null;
    }
  },

  /**
   * Récupérer toutes les ventes en attente
   */
  getPendingSales() {
    try {
      const data = localStorage.getItem(PENDING_SALES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('❌ Erreur lecture localStorage:', err);
      return [];
    }
  },

  /**
   * Marquer une vente comme synchronisée
   */
  markAsSynced(saleId) {
    try {
      const pending = this.getPendingSales();
      const updated = pending.map(sale =>
        sale.id === saleId
          ? { ...sale, status: 'completed', syncedAt: new Date().toISOString() }
          : sale
      );
      localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(updated));
      console.log('✅ Vente marquée comme synchronisée:', saleId);
    } catch (err) {
      console.error('❌ Erreur mise à jour:', err);
    }
  },

  /**
   * Marquer une vente comme échouée et incrémenter le compteur de tentatives
   */
  markAsFailed(saleId, error) {
    try {
      const pending = this.getPendingSales();
      const updated = pending.map(sale =>
        sale.id === saleId
          ? {
              ...sale,
              status: 'failed',
              error: error?.message || 'Erreur inconnue',
              retryCount: (sale.retryCount || 0) + 1,
              lastError: new Date().toISOString(),
            }
          : sale
      );
      localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(updated));
      console.warn('⚠️ Vente marquée comme échouée:', saleId, error?.message);
    } catch (err) {
      console.error('❌ Erreur marquage échoué:', err);
    }
  },

  /**
   * Supprimer une vente de la queue
   */
  removePendingSale(saleId) {
    try {
      const pending = this.getPendingSales();
      const updated = pending.filter(sale => sale.id !== saleId);
      localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(updated));
      console.log('🗑️ Vente supprimée de la queue:', saleId);
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
    }
  },

  /**
   * Récupérer les ventes à réessayer (échouées mais pas trop de tentatives)
   */
  getPendingSalesToRetry() {
    try {
      const pending = this.getPendingSales();
      return pending.filter(
        sale =>
          (sale.status === 'pending' || sale.status === 'failed') &&
          (sale.retryCount || 0) < 5 // Max 5 tentatives
      );
    } catch (err) {
      console.error('❌ Erreur récupération retry:', err);
      return [];
    }
  },

  /**
   * Obtenir le statut de synchronisation
   */
  getSyncStatus() {
    try {
      const data = localStorage.getItem(SYNC_STATUS_KEY);
      return data ? JSON.parse(data) : { lastSync: null, syncing: false };
    } catch (err) {
      return { lastSync: null, syncing: false };
    }
  },

  /**
   * Mettre à jour le statut de synchronisation
   */
  setSyncStatus(status) {
    try {
      const current = this.getSyncStatus();
      const updated = {
        ...current,
        ...status,
        lastStatusUpdate: new Date().toISOString(),
      };
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('❌ Erreur mise à jour sync status:', err);
    }
  },

  /**
   * Nettoyer les ventes complétées
   */
  cleanupCompletedSales() {
    try {
      const pending = this.getPendingSales();
      const updated = pending.filter(sale => sale.status !== 'completed');
      localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(updated));
      console.log('🧹 Nettoyage des ventes complétées');
    } catch (err) {
      console.error('❌ Erreur nettoyage:', err);
    }
  },

  /**
   * Réinitialiser complètement la queue (danger - à utiliser avec prudence)
   */
  resetQueue() {
    try {
      localStorage.removeItem(PENDING_SALES_KEY);
      localStorage.removeItem(SYNC_STATUS_KEY);
      console.log('🔄 Queue réinitialisée');
    } catch (err) {
      console.error('❌ Erreur réinitialisation:', err);
    }
  },

  /**
   * Obtenir les statistiques de la queue
   */
  getQueueStats() {
    const pending = this.getPendingSales();
    return {
      total: pending.length,
      pending: pending.filter(s => s.status === 'pending').length,
      failed: pending.filter(s => s.status === 'failed').length,
      completed: pending.filter(s => s.status === 'completed').length,
    };
  },
};
