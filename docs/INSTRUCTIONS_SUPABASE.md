# Instructions de mise à jour Supabase

## 1. Appliquer la migration (obligatoire)

La fonction RPC `process_sale` est requise pour enregistrer les ventes de manière transactionnelle.

### Étapes

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Cliquez sur **New query**
4. Copiez-collez le contenu du fichier `docs/MIGRATION_VENTE_TRANSACTIONNELLE.sql`
5. Cliquez sur **Run** (ou Ctrl+Enter)
6. Vérifiez qu'il n'y a pas d'erreur (message "Success. No rows returned")

### Contenu de la migration

La migration crée la fonction `process_sale` qui :
- Enregistre une vente
- Met à jour le stock
- Tout en une seule transaction (si une opération échoue, tout est annulé)

---

## 2. Vérification (optionnel)

Pour vérifier que la fonction existe :

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'process_sale';
```

Vous devez voir une ligne avec `process_sale`.

---

## 3. En cas de problème

- **Erreur "permission denied"** : assurez-vous d'être connecté en tant qu'owner du projet
- **Erreur "function already exists"** : la migration utilise `CREATE OR REPLACE`, cela devrait mettre à jour la fonction existante
- Si le schéma a été modifié manuellement, vérifiez que les tables `products` et `sales` ont bien la structure attendue (voir `docs/DATABASE_SCHEMA.sql`)
