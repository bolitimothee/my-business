# 🔄 Système de Persistence des Ventes

## 📋 Vue d'ensemble

Ce système garantit que **aucune vente ne sera jamais perdue**, même si :
- L'utilisateur rafraîchit la page
- La connexion internet s'interrompt
- Supabase est temporairement indisponible
- La session expire

## 🏗️ Architecture

### 1. **salePersistenceService.js**
Service localStorage qui gère une "file d'attente" des ventes :
- Sauvegarde les ventes avant envoi à Supabase
- Marque le statut : `pending`, `syncing`, `failed`, `completed`
- Permet les retries (max 5 tentatives)
- Nettoie automatiquement les ventes complétées

### 2. **useSaleSync.js**
Hook React qui :
- Resynchronise automatiquement les ventes au démarrage
- Vérifie toutes les 30 secondes s'il y a des ventes à renvoyer
- Met à jour le statut de synchronisation
- Rappelle le parent quand la sync est complète

### 3. **CommerceApp.jsx**
Modifications principales :
- Sauvegarde locale **AVANT** l'envoi à Supabase
- Marque comme synced quand c'est ok
- Affiche le nombre de ventes en attente dans le header

## 🔄 Flux de Vente Transactionnel

```
┌─────────────────┐
│   Utilisateur   │
│   Enregistre    │
│     une vente   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ 1️⃣ SAUVEGARDE LOCALE        │
│ (localStorage)              │
│ Status: "pending"           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 2️⃣ ENVOI À SUPABASE (RPC)  │
│ Transactionnelle atomique   │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
  SUCCESS     ERREUR
    │          │
    │          └──► Status: "failed"
    │              (gardée pour retry)
    │
    ▼
┌─────────────────────────────┐
│ 3️⃣ MARQUER COMME SYNCED     │
│ Status: "completed"         │
│ (nettoyage après 5min)      │
└─────────────────────────────┘
```

## 🛠️ API du Service

### Ajouter une vente
```javascript
const pendingSaleId = salePersistenceService.addPendingSale({
  product_id: 1,
  quantity: 5,
  product_name: "Produit A",
  sale_price: 1000,
  cost_price: 600
});
```

### Marquer comme synchronisée
```javascript
salePersistenceService.markAsSynced(pendingSaleId);
```

### Marquer comme échouée
```javascript
salePersistenceService.markAsFailed(pendingSaleId, error);
```

### Obtenir les ventes en attente
```javascript
const pending = salePersistenceService.getPendingSalesToRetry();
// Retourne uniquement celles avec < 5 tentatives
```

### Voir les statistiques
```javascript
const stats = salePersistenceService.getQueueStats();
// { total: 3, pending: 1, failed: 2, completed: 0 }
```

## 📊 Statuts des Ventes

| Statut | Signification | Action |
|--------|---------------|--------|
| `pending` | En attente d'envoi | Sera envoyée prochainement |
| `syncing` | En train d'être envoyée | Ne pas retoucher |
| `failed` | Erreur lors de l'envoi | Sera retentée (max 5 fois) |
| `completed` | Synchronisée avec succès | Sera nettoyée après 5 min |

## 🔍 Monitoring

**Console browser (F12)** :
- 💾 `Vente sauvegardée localement` → ok
- 📤 `Synchronisation de X vente(s)` → sync en cours
- ✅ `Vente synchronisée avec succès` → complète
- ❌ `Erreur RPC` → échec (retry automatique)

**Indicateur dans le header** :
- 🟠 Badge orange = ventes en attente
- Affiche le total des en-attente + échouées

## 📱 Comportement en Offline

1. Utilisateur enregistre une vente (pas de réseau)
2. ✅ Sauvegardée localement immédiatement
3. ❌ Envoi échoue → Status: "failed"
4. Utilisateur revient online
5. Hook `useSaleSync` lance le retry automatique
6. ✅ Vente envoyée et synchronisée

## 🧹 Nettoyage Automatique

- Les ventes `completed` sont supprimées après 5 minutes
- Appelé après chaque synchronisation réussie
- Peut être forcé : `salePersistenceService.cleanupCompletedSales()`

## 🚨 Gestion des Erreurs

### Erreur RLS/500
- Vente sauvegardée localement
- Retry automatique après 30 secondes
- L'utilisateur peut continuer à travailler

### Erreur Stock Insuffisant
- Validée **avant** sauvegarde locale
- Empêche l'enregistrement (pas de queue)
- Message d'alerte immédiat

### Timeout Supabase
- Vente marquée comme échouée
- Conservée localement pour retry
- Max 5 tentatives puis archivée

## 🔗 Fichiers Modifiés

- [src/services/salePersistenceService.js](../../src/services/salePersistenceService.js) - Gestion localStorage
- [src/services/useSaleSync.js](../../src/services/useSaleSync.js) - Hook synchronisation
- [src/CommerceApp.jsx](../../src/CommerceApp.jsx) - Intégration avec l'UI
- [src/styles/Navigation.css](../../src/styles/Navigation.css) - Indicateur queue

## 📝 Exemples d'Usage

### Vérifier les ventes en attente
```javascript
const stats = salePersistenceService.getQueueStats();
console.log(`${stats.pending} ventes en attente, ${stats.failed} échouées`);
```

### Forcer une synchronisation
```javascript
// Hook useSaleSync expose cette fonction
processPendingSales();
```

### Réinitialiser complètement
```javascript
// ⚠️ À utiliser avec prudence
salePersistenceService.resetQueue();
```

## 🎯 Avantages

✅ **Zéro perte de données** - Tout est sauvegardé localement  
✅ **Expérience offline** - Fonctionne sans connexion  
✅ **Retry automatique** - Resynchronisation intelligente  
✅ **Monitoring en temps réel** - Voir l'état des ventes  
✅ **Transactions atomiques** - Vente + stock mis à jour ensemble  
✅ **Fallback intelligent** - Continue même si Supabase lent  

