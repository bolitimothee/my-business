import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AdminPanel.css';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      setUsers(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      console.error('Error loading users:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);
      if (updateError) throw updateError;
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      console.error('Error updating user:', err);
      setError(message);
    }
  };

  const setExpiry = async (userId) => {
    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ expiry_date: expiryDate || null })
        .eq('user_id', userId);
      if (updateError) throw updateError;
      setEditingUserId(null);
      setExpiryDate('');
      setError(null);
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      console.error('Error setting expiry:', err);
      setError(message);
    }
  };

  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Gestion des Utilisateurs</h2>

      <div className="admin-stats">
        <div className="stat-card">
          <p className="stat-label">Utilisateurs Totaux</p>
          <p className="stat-value">{users.length}</p>
        </div>
        <div className="stat-card active">
          <p className="stat-label">Actifs</p>
          <p className="stat-value">{activeUsers}</p>
        </div>
        <div className="stat-card inactive">
          <p className="stat-label">Inactifs</p>
          <p className="stat-value">{inactiveUsers}</p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="error-close-btn"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <p className="loading">Chargement...</p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date d'expiration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} className={!u.is_active ? 'inactive-row' : ''}>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    {editingUserId === u.user_id ? (
                      <div className="expiry-edit">
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="date-input"
                        />
                        <button
                          onClick={() => setExpiry(u.user_id)}
                          className="btn-confirm"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <>
                        {u.expiry_date ? new Date(u.expiry_date).toLocaleDateString('fr-FR') : 'Non définie'}
                      </>
                    )}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => toggleUserStatus(u.user_id, u.is_active)}
                      className={`btn-action ${u.is_active ? 'deactivate' : 'activate'}`}
                    >
                      {u.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    {editingUserId !== u.user_id && (
                      <button
                        onClick={() => {
                          setEditingUserId(u.user_id);
                          setExpiryDate(u.expiry_date || '');
                        }}
                        className="btn-action edit"
                      >
                        Expiry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
