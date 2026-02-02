-- ============================================================
-- SCRIPT COMPLET POUR GESTION DE COMMERCE
-- Avec gestion des accès ET périodes de validité
-- ============================================================

-- 1. SUPPRIMER LES TABLES EXISTANTES (si vous recommencez)
-- Décommentez ces lignes uniquement si vous voulez tout effacer
-- DROP TABLE IF EXISTS sales CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. TABLE DES PROFILS UTILISATEURS
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
  -- ⚠️ PAS DE VIRGULE ICI (erreur dans ton code)
);

-- 3. TABLE DES PRODUITS
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  cost_price NUMERIC(15,2) NOT NULL CHECK (cost_price >= 0),
  sale_price NUMERIC(15,2) NOT NULL CHECK (sale_price >= 0),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE DES VENTES
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(15,2) NOT NULL CHECK (total_price >= 0),
  cost_price NUMERIC(15,2) NOT NULL CHECK (cost_price >= 0),
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INDEX POUR OPTIMISER LES PERFORMANCES
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_date ON sales(sale_date DESC);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_user_profiles_expiry ON user_profiles(expiry_date);

-- 6. ACTIVER ROW LEVEL SECURITY (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- 7. FONCTION POUR VÉRIFIER SI UN COMPTE EST VALIDE
CREATE OR REPLACE FUNCTION is_account_valid(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_active BOOLEAN;
  v_expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT is_active, expiry_date 
  INTO v_is_active, v_expiry_date
  FROM user_profiles 
  WHERE user_id = p_user_id;
  
  -- Si pas de profil, invalide
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Si désactivé, invalide
  IF NOT v_is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Si expiré, invalide
  IF v_expiry_date IS NOT NULL AND v_expiry_date < NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Sinon, valide
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. POLITIQUES POUR user_profiles (AVEC VÉRIFICATION D'EXPIRATION)

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur profil (sauf role, is_active, expiry_date)
CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Les admins peuvent voir TOUS les profils
CREATE POLICY "Admins can view all profiles" 
  ON user_profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Les admins peuvent mettre à jour TOUS les profils (y compris role, is_active, expiry_date)
CREATE POLICY "Admins can update all profiles" 
  ON user_profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- 9. POLITIQUES POUR products (BLOQUÉES SI COMPTE EXPIRÉ)

CREATE POLICY "Users can view own products if account valid" 
  ON products FOR SELECT 
  USING (auth.uid() = user_id AND is_account_valid(auth.uid()));

CREATE POLICY "Users can insert own products if account valid" 
  ON products FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND is_account_valid(auth.uid()));

CREATE POLICY "Users can update own products if account valid" 
  ON products FOR UPDATE 
  USING (auth.uid() = user_id AND is_account_valid(auth.uid()));

CREATE POLICY "Users can delete own products if account valid" 
  ON products FOR DELETE 
  USING (auth.uid() = user_id AND is_account_valid(auth.uid()));

-- 10. POLITIQUES POUR sales (BLOQUÉES SI COMPTE EXPIRÉ)

CREATE POLICY "Users can view own sales if account valid" 
  ON sales FOR SELECT 
  USING (auth.uid() = user_id AND is_account_valid(auth.uid()));

CREATE POLICY "Users can insert own sales if account valid" 
  ON sales FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND is_account_valid(auth.uid()));

CREATE POLICY "Users can delete own sales if account valid" 
  ON sales FOR DELETE 
  USING (auth.uid() = user_id AND is_account_valid(auth.uid()));

-- 11. FONCTION POUR METTRE À JOUR updated_at AUTOMATIQUEMENT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. TRIGGERS POUR updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 13. FONCTION POUR CRÉER AUTOMATIQUEMENT LE PROFIL LORS DE L'INSCRIPTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      -- Si l'email contient "admin", créer un compte admin
      WHEN NEW.email ILIKE '%admin%' THEN 'admin'
      ELSE 'user'
    END,
    true  -- Compte actif par défaut
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. TRIGGER POUR CRÉATION AUTOMATIQUE DU PROFIL
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 15. VÉRIFICATION FINALE
-- ============================================================

-- Afficher toutes les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Afficher toutes les politiques RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================================
-- SCRIPT TERMINÉ ✅
-- ============================================================