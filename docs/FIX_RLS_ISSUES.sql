-- ============================================================
-- FIX RLS ISSUES - À EXÉCUTER DANS SUPABASE SQL EDITOR
-- ============================================================
-- Ces problèmes RLS causaient les erreurs 500 et 400

-- 1. SUPPRIMER les anciennes politiques RLS
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- 2. CRÉER de NOUVELLES politiques RLS pour user_profiles (plus permissives)

-- Les utilisateurs authentifiés PEUVENT TOUJOURS voir leur propre profil
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

-- Les utilisateurs authentifiés PEUVENT créer leur propre profil
CREATE POLICY "Users can insert own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs authentifiés PEUVENT mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les admins PEUVENT voir tous les profils
CREATE POLICY "Admins can view all profiles" 
  ON user_profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Les admins PEUVENT mettre à jour tous les profils
CREATE POLICY "Admins can update all profiles" 
  ON user_profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- 3. VÉRIFIER que RLS est bien activé
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- 4. Ajouter l'index manquant pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================
-- APRÈS exécution :
-- 1. Testez l'authentification
-- 2. Vérifiez les logs de la console (devrait afficher ✅ au lieu de ❌)
-- 3. Si erreur 500 persiste, vérifiez les tables produits et ventes aussi
-- ============================================================
