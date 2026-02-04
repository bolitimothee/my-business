-- ============================================================
-- MIGRATION: Vente transactionnelle (évite les pertes de données)
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- Fonction RPC qui enregistre une vente ET met à jour le stock en une seule transaction
-- Si une des opérations échoue, tout est annulé (rollback)
CREATE OR REPLACE FUNCTION public.process_sale(
  p_product_id BIGINT,
  p_quantity INTEGER,
  p_product_name TEXT,
  p_sale_price NUMERIC,
  p_cost_price NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_quantity INTEGER;
  v_total_price NUMERIC;
  v_sale_id BIGINT;
BEGIN
  -- Récupérer l'utilisateur connecté
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Utilisateur non authentifié');
  END IF;

  -- Vérifier le stock actuel
  SELECT quantity INTO v_current_quantity
  FROM products
  WHERE id = p_product_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Produit non trouvé');
  END IF;

  IF v_current_quantity < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stock insuffisant');
  END IF;

  v_total_price := p_sale_price * p_quantity;

  -- Insertion de la vente
  INSERT INTO sales (user_id, product_id, product_name, quantity, total_price, cost_price, sale_date)
  VALUES (v_user_id, p_product_id, p_product_name, p_quantity, v_total_price, p_cost_price, NOW())
  RETURNING id INTO v_sale_id;

  -- Mise à jour du stock
  UPDATE products
  SET quantity = quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id AND user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'sale_id', v_sale_id);
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.process_sale(BIGINT, INTEGER, TEXT, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_sale(BIGINT, INTEGER, TEXT, NUMERIC, NUMERIC) TO service_role;
