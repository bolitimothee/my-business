-- ============================================
-- CORRIGER LES RLS POUR PRODUCTS ET SALES
-- Exécuter dans Supabase SQL Editor
-- ============================================

-- SUPPRIMER LES ANCIENNES POLITIQUES RLS RESTRICTIVES
DROP POLICY IF EXISTS "Users can view own products if account valid" ON products;
DROP POLICY IF EXISTS "Users can insert own products if account valid" ON products;
DROP POLICY IF EXISTS "Users can update own products if account valid" ON products;
DROP POLICY IF EXISTS "Users can delete own products if account valid" ON products;

DROP POLICY IF EXISTS "Users can view own sales if account valid" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales if account valid" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales if account valid" ON sales;

-- ============================================
-- CRÉER DES POLITIQUES SIMPLES ET EFFICACES
-- ============================================

-- PRODUCTS: Seulement vérifier que c'est le propriétaire
CREATE POLICY "Users can view own products" 
  ON products FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" 
  ON products FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" 
  ON products FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" 
  ON products FOR DELETE 
  USING (auth.uid() = user_id);

-- SALES: Seulement vérifier que c'est le propriétaire
CREATE POLICY "Users can view own sales" 
  ON sales FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales" 
  ON sales FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales" 
  ON sales FOR DELETE 
  USING (auth.uid() = user_id);

-- USER_PROFILES: Permettre aux utilisateurs de gérer leur profil
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Admins peuvent voir et modifier tous les profils
CREATE POLICY "Admins can view all profiles" 
  ON user_profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" 
  ON user_profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Afficher toutes les politiques RLS actuelles
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ✅ DONE
