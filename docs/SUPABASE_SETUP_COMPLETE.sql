-- ============================================================
-- SCRIPT COMPLET - CORRECTION ET SETUP SUPABASE
-- À COPIER ET COLLER DANS: Supabase SQL Editor
-- Projet: iyoamiqbnhowbhirakod
-- ============================================================

-- ============================================================
-- PARTIE 1: SUPPRIMER LES ANCIENNES POLITIQUES RLS RESTRICTIVES
-- ============================================================

-- Supprimer les anciennes politiques pour products
DROP POLICY IF EXISTS "Users can view own products if account valid" ON products;
DROP POLICY IF EXISTS "Users can insert own products if account valid" ON products;
DROP POLICY IF EXISTS "Users can update own products if account valid" ON products;
DROP POLICY IF EXISTS "Users can delete own products if account valid" ON products;

-- Supprimer les anciennes politiques pour sales
DROP POLICY IF EXISTS "Users can view own sales if account valid" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales if account valid" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales if account valid" ON sales;

-- ============================================================
-- PARTIE 2: CRÉER LES NOUVELLES POLITIQUES RLS SIMPLES
-- ============================================================

-- ============================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================

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

-- ============================================================
-- SALES TABLE POLICIES
-- ============================================================

CREATE POLICY "Users can view own sales" 
  ON sales FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales" 
  ON sales FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales" 
  ON sales FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================
-- USER_PROFILES TABLE POLICIES
-- ============================================================

-- Supprimer les anciennes politiques pour user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Créer les nouvelles politiques pour user_profiles
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

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

-- ============================================================
-- PARTIE 3: VÉRIFICATION FINALE
-- ============================================================

-- Afficher toutes les politiques RLS créées
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Afficher l'état des tables RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('products', 'sales', 'user_profiles')
ORDER BY tablename;

-- ============================================================
-- ✅ SETUP COMPLET - PRÊT À L'EMPLOI
-- ============================================================
-- 
-- Ce script corrige les problèmes suivants:
-- 1. ✅ Supprime les anciennes politiques RLS restrictives
-- 2. ✅ Crée des politiques RLS simples (vérifie juste l'ownership)
-- 3. ✅ Permet aux utilisateurs de créer/lire/modifier leurs données
-- 4. ✅ Permet aux admins de gérer les profils
-- 5. ✅ Compatible avec la vérification d'expiration d'abonnement en frontend
--
-- Après l'exécution:
-- 1. Actualisez votre app (F5)
-- 2. Testez: créer produit, vente, déconnexion
-- 3. Les données doivent persister après F5
-- 4. La déconnexion doit fonctionner
--
-- ============================================================
