import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([adminAPI.users(), adminAPI.stats()]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch {
      setMsg('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(''), 3000);
  };

  const promote = async (id) => {
    try {
      const res = await adminAPI.promote(id);
      flash(res.data.message);
      load();
    } catch { flash('Action failed'); }
  };

  const toggle = async (id) => {
    try {
      const res = await adminAPI.toggleStatus(id);
      flash(res.data.message);
      load();
    } catch { flash('Action failed'); }
  };

  if (loading) return <div className="loading-state">Loading admin panel...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <span className="badge badge-admin">ROLE_ADMIN</span>
      </div>

      {msg && <p className="success-msg">{msg}</p>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card card">
            <div className="stat-value">{stats.adminCount}</div>
            <div className="stat-label">Admins</div>
          </div>
          <div className="stat-card card">
            <div className="stat-value">{stats.regularUsers}</div>
            <div className="stat-label">Regular Users</div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">User Management</h2>
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Provider</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><code>#{u.id}</code></td>
                  <td>{u.name}</td>
                  <td className="mono">{u.email}</td>
                  <td>
                    <span className={`badge ${u.provider === 'GOOGLE' ? 'badge-google' : 'badge-user'}`}>
                      {u.provider}
                    </span>
                  </td>
                  <td>
                    <div className="roles-list">
                      {u.roles?.map(r => (
                        <span key={r} className={`badge ${r.includes('ADMIN') ? 'badge-admin' : 'badge-user'}`}>
                          {r.replace('ROLE_', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-dot ${u.enabled ? 'active' : 'inactive'}`}>
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {!u.roles?.includes('ROLE_ADMIN') && (
                        <button className="btn btn-outline btn-sm" onClick={() => promote(u.id)}>
                          Promote
                        </button>
                      )}
                      <button
                        className={`btn btn-sm ${u.enabled ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggle(u.id)}
                      >
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
