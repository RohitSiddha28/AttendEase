import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newClass.name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/classes', newClass);
      setClasses(prev => [res.data, ...prev]);
      setNewClass({ name: '', description: '' });
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (classId) => {
    try {
      await api.delete(`/classes/${classId}`);
      setClasses(prev => prev.filter(c => c._id !== classId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete class');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display', fontSize: 32, color: '#f5f5f5', lineHeight: 1.2 }}>
            Good day, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ color: '#555', marginTop: 4, fontSize: 14 }}>
            {classes.length} class{classes.length !== 1 ? 'es' : ''} · Manage attendance with ease
          </p>
        </div>
        <button
          className="btn-amber"
          onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Class
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#ef4444', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 460, padding: 28 }}>
            <h2 style={{ fontFamily: 'DM Serif Display', fontSize: 22, color: '#f5f5f5', marginBottom: 20 }}>
              Create New Class
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class Name *</label>
                <input className="input-dark" placeholder="e.g. B.Tech CSE 3rd Year" value={newClass.name} onChange={e => setNewClass(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                <input className="input-dark" placeholder="e.g. Section A, 2024–25" value={newClass.description} onChange={e => setNewClass(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-amber" style={{ flex: 1 }} disabled={creating || !newClass.name.trim()}>
                  {creating ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 400, padding: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f5f5f5', marginBottom: 8 }}>Delete Class?</h2>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
              This will delete <strong style={{ color: '#f59e0b' }}>{deleteConfirm.name}</strong> and all its attendance records. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                style={{ flex: 1, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleDelete(deleteConfirm._id)}
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card" style={{ height: 180, opacity: 0.4 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 12 }} />
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontFamily: 'DM Serif Display', fontSize: 24, color: '#f5f5f5', marginBottom: 8 }}>No Classes Yet</h3>
          <p style={{ color: '#555', marginBottom: 24, fontSize: 15 }}>Create your first class to start tracking attendance.</p>
          <button className="btn-amber" onClick={() => setShowCreate(true)}>+ Create First Class</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {classes.map(cls => (
            <div key={cls._id} className="glass-card animate-fade-in" style={{ padding: 24, cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate(`/class/${cls._id}`)}>

              {/* Color accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 2, background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: '0 0 4px 4px', opacity: 0.6 }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, marginRight: 8 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: '#f5f5f5', lineHeight: 1.3 }}>{cls.name}</h3>
                  {cls.description && <p style={{ color: '#666', fontSize: 13, marginTop: 3 }}>{cls.description}</p>}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setDeleteConfirm(cls); }}
                  style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#ef4444'}
                  onMouseLeave={e => e.target.style.color = '#444'}
                >✕</button>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>{cls.students.length}</div>
                  <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students</div>
                </div>
                <div style={{ width: 1, background: '#2a2a2a' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>{cls.subjects.length}</div>
                  <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/class/${cls._id}/attendance`} onClick={e => e.stopPropagation()}
                  style={{ flex: 1, textAlign: 'center', padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 7, color: '#f59e0b', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                  Mark Attendance
                </Link>
                <Link to={`/class/${cls._id}/analytics`} onClick={e => e.stopPropagation()}
                  style={{ flex: 1, textAlign: 'center', padding: '8px 12px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 7, color: '#888', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                  Analytics
                </Link>
              </div>

              <p style={{ color: '#333', fontSize: 11, marginTop: 12 }}>Created {formatDate(cls.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
