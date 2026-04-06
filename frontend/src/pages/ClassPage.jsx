import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ClassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newStudent, setNewStudent] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  const [newSubject, setNewSubject] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);

  useEffect(() => { fetchClass(); }, [id]);

  const fetchClass = async () => {
    try {
      const res = await api.get(`/classes/${id}`);
      setCls(res.data);
    } catch {
      setError('Class not found');
    } finally { setLoading(false); }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.trim()) return;
    setAddingStudent(true);
    try {
      const res = await api.post(`/classes/${id}/students`, { name: newStudent.trim() });
      setCls(res.data);
      setNewStudent('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add student');
    } finally { setAddingStudent(false); }
  };

  const deleteStudent = async (name) => {
    try {
      const res = await api.delete(`/classes/${id}/students/${encodeURIComponent(name)}`);
      setCls(res.data);
    } catch { setError('Failed to remove student'); }
  };

  const addSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    setAddingSubject(true);
    try {
      const res = await api.post(`/classes/${id}/subjects`, { name: newSubject.trim() });
      setCls(res.data);
      setNewSubject('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add subject');
    } finally { setAddingSubject(false); }
  };

  const deleteSubject = async (name) => {
    try {
      const res = await api.delete(`/classes/${id}/subjects/${encodeURIComponent(name)}`);
      setCls(res.data);
    } catch { setError('Failed to remove subject'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 32, height: 32, border: '2px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (error && !cls) return <div style={{ textAlign: 'center', padding: 80, color: '#ef4444' }}>{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: '#555' }}>
        <Link to="/" style={{ color: '#555', textDecoration: 'none' }} className="hover-line">Dashboard</Link>
        <span>›</span>
        <span style={{ color: '#f59e0b' }}>{cls?.name}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'DM Serif Display', fontSize: 30, color: '#f5f5f5', lineHeight: 1.2 }}>{cls?.name}</h1>
        {cls?.description && <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{cls.description}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <Link to={`/class/${id}/attendance`} className="btn-amber" style={{ textDecoration: 'none', fontSize: 14, padding: '9px 18px' }}>
            📝 Mark Attendance
          </Link>
          <Link to={`/class/${id}/analytics`} className="btn-ghost" style={{ textDecoration: 'none', fontSize: 14, padding: '9px 18px' }}>
            📊 View Analytics
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 20 }}>
          {error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 8 }}>✕</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Students */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f5f5f5' }}>Students</h2>
            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
              {cls?.students?.length || 0}
            </span>
          </div>

          <form onSubmit={addStudent} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="input-dark"
              placeholder="Add student name..."
              value={newStudent}
              onChange={e => setNewStudent(e.target.value)}
              style={{ flex: 1, fontSize: 14 }}
            />
            <button type="submit" className="btn-amber" disabled={addingStudent || !newStudent.trim()} style={{ padding: '10px 16px', fontSize: 14, whiteSpace: 'nowrap' }}>
              {addingStudent ? '...' : '+ Add'}
            </button>
          </form>

          <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cls?.students?.length === 0 ? (
              <p style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No students yet. Add one above.</p>
            ) : (
              cls?.students?.map((student, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: '#111', borderRadius: 8, border: '1px solid #1e1e1e',
                  transition: 'border-color 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `hsl(${(i * 47) % 360}, 60%, 35%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 600, color: '#fff'
                    }}>
                      {student[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 14, color: '#e5e5e5' }}>{student}</span>
                  </div>
                  <button
                    onClick={() => deleteStudent(student)}
                    style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, padding: 4, borderRadius: 4 }}
                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                    onMouseLeave={e => e.target.style.color = '#444'}
                  >✕</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subjects */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f5f5f5' }}>Subjects</h2>
            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
              {cls?.subjects?.length || 0}
            </span>
          </div>

          <form onSubmit={addSubject} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="input-dark"
              placeholder="Add subject name..."
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              style={{ flex: 1, fontSize: 14 }}
            />
            <button type="submit" className="btn-amber" disabled={addingSubject || !newSubject.trim()} style={{ padding: '10px 16px', fontSize: 14, whiteSpace: 'nowrap' }}>
              {addingSubject ? '...' : '+ Add'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cls?.subjects?.length === 0 ? (
              <p style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No subjects yet. Add one above.</p>
            ) : (
              cls?.subjects?.map((subject, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#111', borderRadius: 8,
                  border: '1px solid #1e1e1e'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ fontSize: 14, color: '#e5e5e5' }}>{subject}</span>
                  </div>
                  <button
                    onClick={() => deleteSubject(subject)}
                    style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, padding: 4, borderRadius: 4 }}
                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                    onMouseLeave={e => e.target.style.color = '#444'}
                  >✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
