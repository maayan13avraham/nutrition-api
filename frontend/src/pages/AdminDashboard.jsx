import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUsers, updateUser, deleteUser } from '../services/usersService';
import { useLanguage } from '../context/LanguageContext';
import './AdminDashboard.css';

const ROLES = ['user', 'nutritionist', 'admin'];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const ta = t.admin;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userId;

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err?.response?.data?.error?.message || ta.errLoad))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(user, newRole) {
    setUpdatingId(user.userId);
    setError('');
    try {
      await updateUser(user.userId, {
        firstName: user.firstName,
        lastName: user.lastName,
        userRole: newRole,
      });
      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? { ...u, userRole: newRole } : u))
      );
    } catch (err) {
      setError(err?.response?.data?.error?.message || ta.errUpdate);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(userId) {
    setUpdatingId(userId);
    setError('');
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      setError(err?.response?.data?.error?.message || ta.errDelete);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page-layout">
      <Navbar />
      <main className="admin-main">
        <h1>{ta.title}</h1>
        {error && <div className="admin-error">{error}</div>}
        {loading ? (
          <p className="admin-loading">{ta.loading}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{ta.colId}</th>
                <th>{ta.colName}</th>
                <th>{ta.colEmail}</th>
                <th>{ta.colRole}</th>
                <th>{ta.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.userId === currentUserId;
                const isBusy = updatingId === user.userId;
                return (
                  <tr key={user.userId}>
                    <td className="user-id">{user.userId}</td>
                    <td>
                      {user.firstName} {user.lastName}
                      {isSelf && <span className="you-badge">{ta.youBadge}</span>}
                    </td>
                    <td>{user.email || '—'}</td>
                    <td>
                      <select
                        className="role-select"
                        value={user.userRole}
                        disabled={isBusy}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ta.roles[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        disabled={isSelf || isBusy}
                        onClick={() => handleDelete(user.userId)}
                      >
                        {ta.deleteBtn}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
      <Footer />
    </div>
  );
}
