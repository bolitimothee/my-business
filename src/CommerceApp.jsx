import React, { useState, useEffect } from 'react';
import { PlusCircle, Package, TrendingUp, DollarSign, ShoppingCart, Edit2, Trash2, BarChart3, Download, Mail, MessageCircle, X, Menu, Shield, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AdminPanel from './components/admin/AdminPanel';
import { supabase } from './services/supabaseClient';
import './styles/Navigation.css';
import './styles/Dashboard.css';
import './styles/StockManager.css';
import './styles/SalesManager.css';
import './styles/FinanceReport.css';
import './styles/ExportModal.css';
import './styles/CommerceApp.css';

export default function CommerceApp() {
  const { user, userProfile, signOut, isAccountValid, profileLoading, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [exportEmail, setExportEmail] = useState('');
  const [exportPhone, setExportPhone] = useState('');
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    cost_price: 0,
    sale_price: 0,
    category: '',
  });
  const [saleForm, setSaleForm] = useState({ product_id: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user && isAccountValid && !profileLoading) {
      loadProducts();
      loadSales();
    }
  }, [user, isAccountValid, profileLoading]);

  const loadProducts = async () => {
    if (!user || profileLoading) return;
    setAppLoading(true);
    setError(null);
    try {
      console.log('📥 Chargement produits pour user:', user.id);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (fetchError) {
        console.error('❌ Erreur fetch produits:', fetchError);
        throw fetchError;
      }
      console.log('✅ Produits chargés:', data?.length || 0);
      setProducts(data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('🔴 loadProducts Error:', message);
      setError(`❌ Erreur chargement: ${message}`);
    } finally {
      setAppLoading(false);
    }
  };

  const loadSales = async () => {
    if (!user) return;
    try {
      console.log('📥 Chargement ventes pour user:', user.id);
      const { data, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false });
      if (fetchError) {
        console.error('❌ Erreur fetch ventes:', fetchError);
        throw fetchError;
      }
      console.log('✅ Ventes chargées:', data?.length || 0);
      setSales(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('🔴 loadSales Error:', message);
    }
  };

  const handleAddProduct = async () => {
    if (!user) {
      setError('❌ Utilisateur non authentifié');
      return;
    }
    if (!formData.name || !formData.quantity || !formData.cost_price || !formData.sale_price || !formData.category) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    try {
      if (editingId) {
        console.log('📝 Mise à jour produit:', editingId);
        const { error: updateError, data } = await supabase
          .from('products')
          .update({
            name: formData.name,
            quantity: Number(formData.quantity),
            cost_price: Number(formData.cost_price),
            sale_price: Number(formData.sale_price),
            category: formData.category,
          })
          .eq('id', editingId)
          .eq('user_id', user.id);
        if (updateError) {
          console.error('❌ Erreur mise à jour:', updateError);
          throw updateError;
        }
        console.log('✅ Produit mis à jour');
        setEditingId(null);
      } else {
        console.log('➕ Création nouveau produit');
        const { error: insertError, data } = await supabase
          .from('products')
          .insert({
            user_id: user.id,
            name: formData.name,
            quantity: Number(formData.quantity),
            cost_price: Number(formData.cost_price),
            sale_price: Number(formData.sale_price),
            category: formData.category,
          });
        if (insertError) {
          console.error('❌ Erreur insertion:', insertError);
          throw insertError;
        }
        console.log('✅ Produit créé');
      }
      setFormData({ name: '', quantity: 0, cost_price: 0, sale_price: 0, category: '' });
      await loadProducts();
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('🔴 handleAddProduct Error:', message);
      setError(`❌ Erreur: ${message}`);
    }
  };

  const handleSale = async () => {
    if (!user) {
      setError('❌ Utilisateur non authentifié');
      return;
    }
    if (!saleForm.product_id || !saleForm.quantity) {
      alert('Veuillez sélectionner un produit et une quantité');
      return;
    }

    try {
      const product = products.find(p => p.id === Number(saleForm.product_id));
      if (!product) {
        alert('Produit non trouvé');
        return;
      }

      const quantity = Number(saleForm.quantity);
      if (quantity > product.quantity) {
        alert('Stock insuffisant!');
        return;
      }

      // RPC transactionnelle : vente + mise à jour stock en une seule opération atomique
      const { data, error: rpcError } = await supabase.rpc('process_sale', {
        p_product_id: product.id,
        p_quantity: quantity,
        p_product_name: product.name,
        p_sale_price: Number(product.sale_price),
        p_cost_price: Number(product.cost_price),
      });

      if (rpcError) {
        console.error('❌ Erreur process_sale:', rpcError);
        throw rpcError;
      }

      if (data && !data.success) {
        throw new Error(data.error || 'Erreur lors de la vente');
      }

      console.log('✅ Vente enregistrée et stock mis à jour');

      setSaleForm({ product_id: '', quantity: '' });
      await loadProducts();
      await loadSales();
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('🔴 handleSale Error:', message);
      setError(`❌ Erreur: ${message}`);
    }
  };

  const deleteProduct = async (id) => {
    if (!user) return;
    if (!window.confirm('Supprimer ce produit?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
      await loadProducts();
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
    }
  };

  const editProduct = (product) => {
    setFormData({
      name: product.name,
      quantity: product.quantity,
      cost_price: product.cost_price,
      sale_price: product.sale_price,
      category: product.category,
    });
    setEditingId(product.id);
    setActiveTab('stock');
    setShowMenu(false);
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_price), 0);
  const totalCost = sales.reduce((sum, sale) => sum + (Number(sale.cost_price) * sale.quantity), 0);
  const totalProfit = totalRevenue - totalCost;
  const stockValue = products.reduce((sum, p) => sum + (Number(p.cost_price) * p.quantity), 0);

  const generateSalesReport = () => {
    let report = "RAPPORT DES VENTES\n";
    report += "==========================================\n\n";
    report += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    report += "RÉSUMÉ FINANCIER\n";
    report += "----------------\n";
    report += `Chiffre d'affaires: ${totalRevenue.toLocaleString('en-US')} FCFA\n`;
    report += `Coûts totaux: ${totalCost.toLocaleString('en-US')} FCFA\n`;
    report += `Bénéfice net: ${totalProfit.toLocaleString('en-US')} FCFA\n`;
    report += `Marge: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0}%\n\n`;
    report += "DÉTAIL DES VENTES\n";
    report += "----------------\n\n";

    sales.forEach((sale, index) => {
      const profit = Number(sale.total_price) - (Number(sale.cost_price) * sale.quantity);
      report += `Vente ${index + 1}\n`;
      report += `Date: ${new Date(sale.sale_date).toLocaleDateString('fr-FR')}\n`;
      report += `Produit: ${sale.product_name}\n`;
      report += `Quantité: ${sale.quantity}\n`;
      report += `Total: ${Number(sale.total_price).toLocaleString('en-US')} FCFA\n`;
      report += `Bénéfice: ${profit.toLocaleString('en-US')} FCFA\n`;
      report += "---\n";
    });

    return report;
  };

  const downloadReport = () => {
    const report = generateSalesReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-ventes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sendViaEmail = () => {
    const report = generateSalesReport();
    const subject = encodeURIComponent(`Rapport ventes - ${new Date().toLocaleDateString('fr-FR')}`);
    const body = encodeURIComponent(report);
    const mailtoLink = exportEmail
      ? `mailto:${exportEmail}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  };

  const sendViaWhatsApp = () => {
    const report = generateSalesReport();
    const text = encodeURIComponent(report);
    const whatsappLink = exportPhone
      ? `https://wa.me/${exportPhone.replace(/\D/g, '')}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(whatsappLink, '_blank');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (!user || loading) {
    return <div />;
  }

  // DOUBLE PROTECTION: Ne pas afficher le loading du profil ici
  // AppWrapper gère déjà le profileLoading
  // Cette vérification est un fallback au cas où profileLoading se reste coincé
  if (profileLoading) {
    console.warn('⚠️ CommerceApp: ProfileLoading is true, should be handled by AppWrapper');
    // Afficher le contenu quand même après un certain délai
    return (
      <div className="loading-screen">
        <p>Chargement du profil...</p>
      </div>
    );
  }

  // Seulement montrer l'erreur d'accès si le profil a fini de charger ET n'est pas valide
  if (!isAccountValid) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <h1>Accès refusé</h1>
          <p>Votre compte a été désactivé ou a expiré.</p>
          <p>Veuillez contacter l'administrateur.</p>
          <button
            onClick={handleSignOut}
            className="logout-btn"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  if (showAdminPanel && userProfile?.role === 'admin') {
    return (
      <div>
        <header className="admin-header">
          <div className="admin-header-content">
            <div>
              <h1>Gestion de Commerce - Admin</h1>
              <p>Tableau de bord administrateur</p>
            </div>
             <button
              onClick={() => setShowAdminPanel(false)}
              className="admin-close-btn"
            >
              <X size={24} />
            </button>
          </div>
        </header>
        <AdminPanel />
        <button
          onClick={() => setShowAdminPanel(false)}
          className="back-to-dashboard-btn"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Gestion de Commerce</h1>
            <p className="header-subtitle">Système de gestion des stocks et finances</p>
            <p className="header-email">Connecté : {userProfile?.email ?? user?.email ?? '—'}</p>
          </div>
          <div className="header-actions">
            {userProfile?.role === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="admin-btn"
                title="Tableau de bord admin"
              >
                <Shield size={24} />
              </button>
            )}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hamburger-btn"
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              onClick={handleSignOut}
              className="logout-header-btn"
              title="Se déconnecter"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-container">
          {[
            { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
            { id: 'stock', label: 'Stock', icon: Package },
            { id: 'sales', label: 'Ventes', icon: ShoppingCart },
            { id: 'finance', label: 'Finances', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMenu(false);
                }}
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="error-close-btn"
          >
            ×
          </button>
        </div>
      )}

      <main className="main-content">
        {loading ? (
          <div className="loading-container">
            <p>Chargement des données...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="dashboard">
                <h2 className="page-title">Tableau de Bord</h2>
                
                <div className="stats-grid">
                  <div className="stats-card revenue-card">
                    <div>
                      <p className="card-label">Chiffre d'Affaires</p>
                      <p className="card-value revenue">{totalRevenue.toLocaleString('en-US')}</p>
                      <p className="card-currency">FCFA</p>
                    </div>
                    <DollarSign size={32} className="card-icon" />
                  </div>
                  
                  <div className="stats-card profit-card">
                    <div>
                      <p className="card-label">Bénéfice Net</p>
                      <p className="card-value profit">{totalProfit.toLocaleString('en-US')}</p>
                      <p className="card-currency">FCFA</p>
                    </div>
                    <TrendingUp size={32} className="card-icon" />
                  </div>

                  <div className="stats-card stock-card">
                    <div>
                      <p className="card-label">Valeur du Stock</p>
                      <p className="card-value stock">{stockValue.toLocaleString('en-US')}</p>
                      <p className="card-currency">FCFA</p>
                    </div>
                    <Package size={32} className="card-icon" />
                  </div>

                  <div className="stats-card sales-card">
                    <div>
                      <p className="card-label">Ventes Totales</p>
                      <p className="card-value sales">{sales.length}</p>
                      <p className="card-currency">transactions</p>
                    </div>
                    <ShoppingCart size={32} className="card-icon" />
                  </div>
                </div>

                <div className="lists-grid">
                  <div className="card">
                    <h3 className="card-title">Produits en Stock</h3>
                    {products.slice(0, 5).map(product => (
                      <div key={product.id} className="item-row">
                        <div>
                          <p className="item-name">{product.name}</p>
                          <p className="item-category">{product.category}</p>
                        </div>
                        <span className={`badge badge-${product.quantity > 10 ? 'green' : product.quantity > 5 ? 'yellow' : 'red'}`}>
                          {product.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="card">
                    <h3 className="card-title">Dernières Ventes</h3>
                    {sales.slice(0, 5).map(sale => (
                      <div key={sale.id} className="item-row">
                        <div>
                          <p className="item-name">{sale.product_name}</p>
                          <p className="item-category">{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="item-amount">
                          <p className="item-price">{Number(sale.total_price).toLocaleString('en-US')}</p>
                          <p className="item-qty">{sale.quantity} unités</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="stock-manager">
                <h2 className="page-title">Gestion des Stocks</h2>
                
                <div className="form-card">
                  <h3 className="card-title">{editingId ? 'Modifier' : 'Ajouter'} un Produit</h3>
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Nom du produit"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Catégorie"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="input-field"
                    />
                    <input
                      type="number"
                      placeholder="Quantité"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                      className="input-field"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Prix d'achat (FCFA)"
                      value={formData.cost_price || ''}
                      onChange={(e) => setFormData({...formData, cost_price: Number(e.target.value)})}
                      className="input-field"
                      min="0"
                      step="1"
                    />
                    <input
                      type="number"
                      placeholder="Prix de vente (FCFA)"
                      value={formData.sale_price || ''}
                      onChange={(e) => setFormData({...formData, sale_price: Number(e.target.value)})}
                      className="input-field"
                      min="0"
                      step="1"
                    />
                    <button
                      onClick={handleAddProduct}
                      className="btn btn-primary"
                    >
                      <PlusCircle size={20} />
                      {editingId ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Catégorie</th>
                        <th>Qté</th>
                        <th>Prix Achat</th>
                        <th>Prix Vente</th>
                        <th>Marge %</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td className="product-name">{product.name}</td>
                          <td>{product.category}</td>
                          <td>
                            <span className={`badge badge-${Number(product.quantity) > 10 ? 'green' : Number(product.quantity) > 5 ? 'yellow' : 'red'}`}>
                              {product.quantity}
                            </span>
                          </td>
                          <td>{Number(product.cost_price).toLocaleString('en-US')}</td>
                          <td>{Number(product.sale_price).toLocaleString('en-US')}</td>
                          <td className="margin-value">
                            {product.cost_price > 0 
                              ? (((Number(product.sale_price) - Number(product.cost_price)) / Number(product.cost_price)) * 100).toFixed(1)
                              : '0.0'}%
                          </td>
                          <td className="actions-cell">
                            <button onClick={() => editProduct(product)} className="btn-edit" aria-label="Modifier le produit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="btn-delete" aria-label="Supprimer le produit">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="sales-manager">
                <div className="sales-header">
                  <h2 className="page-title">Enregistrer une Vente</h2>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="btn btn-success"
                  >
                    <Download size={18} />
                    Exporter
                  </button>
                </div>
                
                <div className="form-card">
                  <div className="sales-form-grid">
                    <select
                      value={saleForm.product_id}
                      onChange={(e) => setSaleForm({...saleForm, product_id: e.target.value})}
                      className="input-field"
                      aria-label="Sélectionner un produit"
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.quantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Quantité vendue"
                      value={saleForm.quantity}
                      onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
                      className="input-field"
                      min="1"
                    />
                    <button
                      onClick={handleSale}
                      className="btn btn-success"
                    >
                      <ShoppingCart size={20} />
                      Enregistrer
                    </button>
                  </div>
                </div>

                <div className="table-container">
                  <div className="table-header">
                    <h3 className="card-title">Historique des Ventes</h3>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Produit</th>
                        <th>Qté</th>
                        <th>Montant</th>
                        <th>Bénéfice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map(sale => {
                        const profit = Number(sale.total_price) - (Number(sale.cost_price) * sale.quantity);
                        return (
                          <tr key={sale.id}>
                            <td>{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</td>
                            <td className="product-name">{sale.product_name}</td>
                            <td>{sale.quantity}</td>
                            <td className="revenue-value">{Number(sale.total_price).toLocaleString('en-US')}</td>
                            <td className="profit-value">{profit.toLocaleString('en-US')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="finance-report">
                <h2 className="page-title">Rapports Financiers</h2>
                
                <div className="finance-cards">
                  <div className="finance-card revenue">
                    <div>
                      <p className="finance-label">Chiffre d'Affaires</p>
                      <p className="finance-amount revenue">{totalRevenue.toLocaleString('en-US')}</p>
                      <p className="finance-currency">FCFA</p>
                    </div>
                  </div>

                  <div className="finance-card cost">
                    <div>
                      <p className="finance-label">Coûts Totaux</p>
                      <p className="finance-amount cost">{totalCost.toLocaleString('en-US')}</p>
                      <p className="finance-currency">FCFA</p>
                    </div>
                  </div>

                  <div className="finance-card profit">
                    <div>
                      <p className="finance-label">Bénéfice Net</p>
                      <p className="finance-amount profit">{totalProfit.toLocaleString('en-US')}</p>
                      <p className="finance-currency">FCFA</p>
                    </div>
                  </div>
                </div>

                <div className="finance-details-grid">
                  <div className="card">
                    <h3 className="card-title">Détails Financiers</h3>
                    <div className="detail-items">
                      <div className="detail-item">
                        <span>Marge Bénéficiaire</span>
                        <span className="detail-value profit">
                          {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>Valeur du Stock</span>
                        <span className="detail-value stock">{stockValue.toLocaleString('en-US')}</span>
                      </div>
                      <div className="detail-item">
                        <span>Produits</span>
                        <span className="detail-value sales">{products.length}</span>
                      </div>
                      <div className="detail-item">
                        <span>Ventes</span>
                        <span className="detail-value revenue">{sales.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="card-title">Top Produits par Bénéfice</h3>
                    {products
                      .map(p => ({
                        ...p,
                        profit: (Number(p.sale_price) - Number(p.cost_price)) * Number(p.quantity)
                      }))
                      .sort((a, b) => b.profit - a.profit)
                      .slice(0, 5)
                      .map(product => (
                        <div key={product.id} className="product-item">
                          <div>
                            <p className="item-name">{product.name}</p>
                            <p className="item-category">{product.quantity} unités</p>
                          </div>
                          <span className="product-profit">
                            {product.profit.toLocaleString('en-US')} FCFA
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Exporter l'Historique</h3>
              <button onClick={() => setShowExportModal(false)} className="modal-close" aria-label="Fermer">
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <button
                onClick={downloadReport}
                className="btn btn-primary btn-block"
              >
                <Download size={20} />
                Télécharger (Fichier TXT)
              </button>
              
              <div className="modal-section">
                <label className="modal-label">Email (optionnel)</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={exportEmail}
                  onChange={(e) => setExportEmail(e.target.value)}
                  className="input-field"
                />
                <button
                  onClick={sendViaEmail}
                  className="btn btn-secondary btn-block"
                >
                  <Mail size={20} />
                  Envoyer par Email
                </button>
              </div>
              
              <div className="modal-section">
                <label className="modal-label">WhatsApp (optionnel)</label>
                <input
                  type="tel"
                  placeholder="+225 XX XX XX XX XX"
                  value={exportPhone}
                  onChange={(e) => setExportPhone(e.target.value)}
                  className="input-field"
                />
                <button
                  onClick={sendViaWhatsApp}
                  className="btn btn-success btn-block"
                >
                  <MessageCircle size={20} />
                  Envoyer via WhatsApp
                </button>
              </div>
            </div>
            
            <p className="modal-footer">
              Le rapport sera généré au format texte lisible sur tous les appareils
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
