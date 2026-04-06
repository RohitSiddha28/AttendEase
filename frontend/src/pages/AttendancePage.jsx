import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function AttendancePage() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({}); // { studentName: 'present'|'absent' }
  const [saving, setSaving] = useState(false);

  const [allAttendance, setAllAttendance] = useState([]);
  const [viewMode, setViewMode] = useState('mark'); // 'mark' | 'history'
  const [historySubject, setHistorySubject] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [clsRes, attRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/attendance/${id}`)
      ]);
      setCls(clsRes.data);
      setAllAttendance(attRes.data);
      if (clsRes.data.subjects?.length > 0) {
        setSelectedSubject(clsRes.data.subjects[0]);
        setHistorySubject(clsRes.data.subjects[0]);
      }
    } catch {
      setError('Failed to load data');
    } finally { setLoading(false); }
  };

  // When subject or date changes, load existing attendance
  useEffect(() => {
    if (!cls || !selectedSubject || !selectedDate) return;
    const existing = allAttendance.find(a => a.subject === selectedSubject && a.date === selectedDate);
    if (existing) {
      const map = {};
      existing.records.forEach(r => { map[r.student] = r.status; });
      setRecords(map);
    } else {
      // Default all absent
      const map = {};
      cls.students.forEach(s => { map[s] = 'absent'; });
      setRecords(map);
    }
  }, [selectedSubject, selectedDate, allAttendance, cls]);

  const toggleStudent = (student) => {
    setRecords(prev => ({ ...prev, [student]: prev[student] === 'present' ? 'absent' : 'present' }));
  };

  const markAll = (status) => {
    const map = {};
    cls.students.forEach(s => { map[s] = status; });
    setRecords(map);
  };

  const saveAttendance = async () => {
    if (!selectedSubject || !selectedDate) return;
    setSaving(true); setSuccess(''); setError('');
    try {
      const recordsArr = cls.students.map(s => ({ student: s, status: records[s] || 'absent' }));
      const res = await api.post(`/attendance/${id}`, {
        subject: selectedSubject,
        date: selectedDate,
        records: recordsArr
      });
      // Update local state
      setAllAttendance(prev => {
        const idx = prev.findIndex(a => a.subject === selectedSubject && a.date === selectedDate);
        if (idx >= 0) { const n = [...prev]; n[idx] = res.data; return n; }
        return [res.data, ...prev];
      });
      setSuccess('Attendance saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const deleteAttendance = async (subject, date) => {
    const confirmed = window.confirm(`Delete attendance for ${subject} on ${date}? This cannot be undone.`);
    if (!confirmed) return;

    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.delete(`/attendance/${id}/${encodeURIComponent(subject)}/${date}`);
      setAllAttendance(prev => prev.filter(a => !(a.subject === subject && a.date === date)));
      setSuccess('Attendance deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete'); }
    finally { setSaving(false); }
  };

  const presentCount = Object.values(records).filter(s => s === 'present').length;
  const totalCount = cls?.students?.length || 0;
  const selectedAttendanceExists = allAttendance.some(
    a => a.subject === selectedSubject && a.date === selectedDate
  );

  const historyRecords = allAttendance
    .filter(a => a.subject === historySubject)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 32, height: 32, border: '2px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: '#555' }}>
        <Link to="/" style={{ color: '#555', textDecoration: 'none' }}>Dashboard</Link>
        <span>›</span>
        <Link to={`/class/${id}`} style={{ color: '#555', textDecoration: 'none' }}>{cls?.name}</Link>
        <span>›</span>
        <span style={{ color: '#f59e0b' }}>Attendance</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'DM Serif Display', fontSize: 28, color: '#f5f5f5' }}>Mark Attendance</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setViewMode('mark')}
            style={{ padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: viewMode === 'mark' ? '#f59e0b' : '#1a1a1a', color: viewMode === 'mark' ? '#000' : '#888' }}>
            Mark
          </button>
          <button onClick={() => setViewMode('history')}
            style={{ padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: viewMode === 'history' ? '#f59e0b' : '#1a1a1a', color: viewMode === 'history' ? '#000' : '#888' }}>
            History
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#22c55e', marginBottom: 16 }}>
          ✓ {success}
        </div>
      )}

      {viewMode === 'mark' ? (
        <>
          {/* Controls */}
          <div className="glass-card" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</label>
              <select className="input-dark" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                {cls?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
              <input type="date" className="input-dark" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 16px', background: '#111', borderRadius: 8, border: '1px solid #2a2a2a' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e', fontFamily: 'JetBrains Mono' }}>{presentCount}</div>
                <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase' }}>Present</div>
              </div>
              <div style={{ width: 1, height: 36, background: '#2a2a2a' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono' }}>{totalCount - presentCount}</div>
                <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase' }}>Absent</div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => markAll('present')} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 13, cursor: 'pointer' }}>
              ✓ All Present
            </button>
            <button onClick={() => markAll('absent')} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>
              ✗ All Absent
            </button>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => deleteAttendance(selectedSubject, selectedDate)}
              disabled={saving || !selectedAttendanceExists}
              style={{
                padding: '9px 16px',
                borderRadius: 7,
                border: '1px solid rgba(239,68,68,0.4)',
                background: selectedAttendanceExists ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.04)',
                color: selectedAttendanceExists ? '#ef4444' : '#666',
                fontSize: 14,
                cursor: saving || !selectedAttendanceExists ? 'not-allowed' : 'pointer'
              }}
            >
              Delete Selected Day
            </button>
            <button onClick={saveAttendance} className="btn-amber" disabled={saving || cls?.students?.length === 0} style={{ fontSize: 14 }}>
              {saving ? 'Saving...' : '💾 Save Attendance'}
            </button>
          </div>

          {/* Student list */}
          {cls?.students?.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: '#555' }}>No students in this class yet.</p>
              <Link to={`/class/${id}`} style={{ color: '#f59e0b', fontSize: 14, marginTop: 8, display: 'inline-block' }}>← Manage Class</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {cls.students.map((student, i) => {
                const isPresent = records[student] === 'present';
                return (
                  <button
                    key={i}
                    onClick={() => toggleStudent(student)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', borderRadius: 10,
                      border: `1px solid ${isPresent ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.25)'}`,
                      background: isPresent ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.05)',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: `hsl(${(i * 47) % 360}, 55%, 30%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: '#fff'
                    }}>{student[0]?.toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: '#e5e5e5', fontWeight: 500 }}>{student}</div>
                      <div style={{ fontSize: 12, color: isPresent ? '#22c55e' : '#ef4444', marginTop: 2 }}>
                        {isPresent ? '✓ Present' : '✗ Absent'}
                      </div>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: isPresent ? '#22c55e' : 'transparent',
                      border: `2px solid ${isPresent ? '#22c55e' : '#444'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff'
                    }}>{isPresent ? '✓' : ''}</div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* History view */
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter by Subject</label>
            <select className="input-dark" value={historySubject} onChange={e => setHistorySubject(e.target.value)} style={{ maxWidth: 280 }}>
              {cls?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {historyRecords.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: '#555' }}>No attendance records for {historySubject || 'this subject'} yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {historyRecords.map((rec, i) => {
                const presentStudents = rec.records.filter(r => r.status === 'present').map(r => r.student);
                const absentStudents = rec.records.filter(r => r.status === 'absent').map(r => r.student);
                const pct = rec.records.length > 0 ? Math.round((presentStudents.length / rec.records.length) * 100) : 0;

                return (
                  <div key={i} className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f5' }}>
                          {new Date(rec.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{rec.subject}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono',
                          background: pct >= 75 ? 'rgba(34,197,94,0.15)' : pct >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                          color: pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444',
                          border: `1px solid ${pct >= 75 ? 'rgba(34,197,94,0.3)' : pct >= 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                          {pct}%
                        </div>
                        <button
                          onClick={() => deleteAttendance(rec.subject, rec.date)}
                          style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 15 }}
                          onMouseEnter={e => e.target.style.color = '#ef4444'}
                          onMouseLeave={e => e.target.style.color = '#444'}
                        >✕</button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                          Present ({presentStudents.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {presentStudents.length === 0 ? <span style={{ color: '#444', fontSize: 12 }}>None</span> :
                            presentStudents.map((s, j) => (
                              <span key={j} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>{s}</span>
                            ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                          Absent ({absentStudents.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {absentStudents.length === 0 ? <span style={{ color: '#444', fontSize: 12 }}>None</span> :
                            absentStudents.map((s, j) => (
                              <span key={j} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>{s}</span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
