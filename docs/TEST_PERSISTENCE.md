# 🧪 Guide de Test - Système de Persistence

## ✅ Tests à effectuer

### Test 1 : Sauvegarde Locale (CRITIQUE)

**Objectif** : Vérifier qu'une vente est sauvegardée localement avant d'être envoyée à Supabase

**Étapes** :
1. Ouvrir DevTools (F12)
2. Aller dans Application → Storage → Local Storage
3. Enregistrer une vente
4. Vérifier la clé `pending_sales_queue` contient la vente

**Attendu** :
```json
{
  "id": "1707012345678",
  "status": "pending",
  "product_id": 1,
  "quantity": 5,
  "createdAt": "2026-02-04T...",
  ...
}
```

---

### Test 2 : Synchronisation Réussie

**Objectif** : Vérifier qu'une vente est synchronisée avec succès

**Étapes** :
1. Enregistrer une vente (avec connexion internet)
2. Attendre 1-2 secondes
3. Console : regarder les logs ✅ "Vente enregistrée et stock mis à jour"
4. LocalStorage : la vente passe à `status: "completed"`

**Attendu** :
```
💾 Vente sauvegardée localement avec ID: 1707012345678
📤 Synchronisation de 1 vente(s)...
🔄 Synchronisation vente 1707012345678...
✅ Vente synchronisée avec succès: 1707012345678
```

---

### Test 3 : Rafraîchissement Sans Perte (IMPORTANT)

**Objectif** : Vérifier que les ventes ne sont perdues lors du rafraîchissement

**Étapes** :
1. Coupez la connexion internet (F12 → Network → Offline)
2. Enregistrez une vente
3. LocalStorage : vérifier la vente existe (status: "failed")
4. Rafraîchissez la page (Ctrl+R)
5. App charge et lance la resynchronisation
6. Restaurez la connexion internet
7. Regardez les logs : la vente se renvoie automatiquement

**Attendu** :
```
💾 Vente sauvegardée localement avec ID: ...
❌ Erreur process_sale: offline
⚠️ Vente marquée comme échouée
[page rafraîchit]
📤 Synchronisation de 1 vente(s) en attente...
✅ Vente synchronisée avec succès
```

---

### Test 4 : Indicateur Queue

**Objectif** : Vérifier que le badge orange s'affiche

**Étapes** :
1. Coupez la connexion internet
2. Enregistrez 3 ventes
3. Regardez le header : un badge orange avec "3" doit s'afficher
4. Restaurez la connexion
5. Le badge disparaît après la sync

**Attendu** :
```
🟠 Badge orange dans le header avec nombre de ventes en attente
```

---

### Test 5 : Retry Automatique (30 secondes)

**Objectif** : Vérifier que les ventes échouées se renvoient automatiquement

**Étapes** :
1. Coupez internet
2. Enregistrez une vente (fail → queue)
3. Attendez 30 secondes
4. Restaurez la connexion
5. Vérifiez que la vente se renvoie sans action de l'utilisateur

**Attendu** :
```
🔄 Tentative de synchronisation périodique...
✅ Vente synchronisée avec succès
```

---

### Test 6 : Max 5 Retries

**Objectif** : Vérifier que les ventes ne se renvoient que 5 fois max

**Étapes** :
1. Enregistrez une vente (Supabase offline simulé)
2. Laissez échouer 5 fois
3. Après 5 retries : vente archivée
4. Console : doit montrer `retryCount: 5`

**Attendu** :
```
retryCount: 5 → plus de tentatives
```

---

### Test 7 : Statistiques Queue

**Objectif** : Vérifier que les stats sont exactes

**Étapes** :
1. Console : `salePersistenceService.getQueueStats()`
2. Enregistrez 2 ventes
3. `salePersistenceService.getQueueStats()` → doit montrer 2 pending
4. Laissez 1 échouer
5. Stats : 1 pending, 1 failed

**Attendu** :
```javascript
{ total: 2, pending: 1, failed: 1, completed: 0 }
```

---

## 🧬 Tests de Régression

### Vente Normale (Sans Problème)

**Étapes** :
1. Connexion internet normale
2. Enregistrer une vente
3. Vérifier dans Supabase que la vente est bien présente

**Attendu** :
- Vente visible dans la table `sales`
- Stock mis à jour (diminué)

---

### Erreur de Validation

**Étapes** :
1. Essayer d'enregistrer une vente avec stock insuffisant
2. Alerte immédiate "Stock insuffisant!"
3. Vente **NE doit PAS** être sauvegardée localement

**Attendu** :
```
localStorage: pending_sales_queue vide
```

---

## 🔧 Commandes de Test Console

```javascript
// Voir les ventes en attente
salePersistenceService.getPendingSales()

// Voir les stats
salePersistenceService.getQueueStats()

// Voir le statut de sync
salePersistenceService.getSyncStatus()

// Forcer une synchronisation maintenant
processPendingSales() // (exposée par useSaleSync)

// Nettoyer les ventes complétées
salePersistenceService.cleanupCompletedSales()

// Réinitialiser complètement (DANGER)
salePersistenceService.resetQueue()
```

---

## 📱 Tests Mobiles

1. Ouvrir l'app sur téléphone
2. Enregistrer une vente
3. Quitter l'app (Kill the process)
4. Rouvrir l'app
5. Vérifier : vente toujours là et synchronisée

---

## 🎯 Critères de Succès

✅ Aucune vente perdue lors du rafraîchissement  
✅ Retry automatique après 30 secondes  
✅ Indicateur queue visible et juste  
✅ Max 5 tentatives par vente  
✅ Validation du stock avant sauvegarde  
✅ Transactions atomiques (vente + stock ensemble)  
✅ Offline → Online sync automatique  

## 🐛 Debugging

### Logs détaillés activés
Console affiche :
- 💾 Vente sauvegardée
- 📤 Sync en cours
- ✅ Sync réussie
- ❌ Erreurs avec détails

### LocalStorage inspecté
F12 → Application → Local Storage → domain
- Clé `pending_sales_queue` visible
- Clé `sales_sync_status` visible

### Supabase logs
Aller dans Supabase Dashboard → Logs
- Vérifier les appels RPC `process_sale`
- Vérifier les erreurs RLS

