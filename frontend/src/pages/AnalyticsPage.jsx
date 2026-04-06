import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

function CircleProgress({ percentage, size = 72, stroke = 6 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 75 ? '#22c55e' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e1e" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill={color} fontSize={13} fontWeight="700" fontFamily="JetBrains Mono">
        {percentage}%
      </text>
    </svg>
  );
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tab, setTab] = useState('student'); // 'student' | 'daily'

  // Student analytics
  const [studentName, setStudentName] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [historyOpen, setHistoryOpen] = useState({});

  // Daily view
  const [allAttendance, setAllAttendance] = useState([]);
  const [dailySubject, setDailySubject] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [clsRes, attRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/attendance/${id}`)
      ]);
      setCls(clsRes.data);
      setAllAttendance(attRes.data);
      if (clsRes.data.subjects?.length > 0) setDailySubject(clsRes.data.subjects[0]);
    } catch {
      setError('Failed to load data');
    } finally { setLoading(false); }
  };

  const fetchStudentAnalytics = async (name) => {
    const n = name || studentName;
    if (!n.trim()) return;
    setFetching(true); setAnalytics(null);
    try {
      const res = await api.get(`/attendance/${id}/analytics/student?name=${encodeURIComponent(n.trim())}`);
      setAnalytics(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally { setFetching(false); }
  };

  const toggleHistory = (subject) => {
    setHistoryOpen(prev => ({ ...prev, [subject]: !prev[subject] }));
  };

  const dailyRecords = allAttendance
    .filter(a => a.subject === dailySubject)
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
        <span style={{ color: '#f59e0b' }}>Analytics</span>
      </div>

      <h1 style={{ fontFamily: 'DM Serif Display', fontSize: 28, color: '#f5f5f5', marginBottom: 24 }}>
        Analytics — {cls?.name}
      </h1>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 20 }}>
          {error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 8 }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#111', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid #1e1e1e' }}>
        {[{ key: 'student', label: '👤 Student Analytics' }, { key: 'daily', label: '📅 Daily View' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans',
              background: tab === t.key ? '#f59e0b' : 'transparent',
              color: tab === t.key ? '#000' : '#666',
              transition: 'all 0.2s'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'student' ? (
        <div>
          {/* Search */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f5f5f5', marginBottom: 16 }}>Search Student</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <input
                  className="input-dark"
                  list="student-list"
                  placeholder="Type or select student name..."
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') fetchStudentAnalytics(); }}
                />
                <datalist id="student-list">
                  {cls?.students?.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <button className="btn-amber" onClick={() => fetchStudentAnalytics()} disabled={fetching || !studentName.trim()} style={{ fontSize: 14 }}>
                {fetching ? 'Loading...' : 'View Analytics →'}
              </button>
            </div>

            {/* Quick select */}
            {cls?.students?.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cls.students.map(s => (
                  <button key={s} onClick={() => { setStudentName(s); fetchStudentAnalytics(s); }}
                    style={{
                      padding: '4px 12px', borderRadius: 20, border: '1px solid #2a2a2a',
                      background: '#111', color: '#888', fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.color = '#f59e0b'; }}
                    onMouseLeave={e => { e.target.style.borderColor = '#2a2a2a'; e.target.style.color = '#888'; }}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Results */}
          {analytics && (
            <div className="animate-slide-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#000' }}>
                  {analytics.student[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#f5f5f5' }}>{analytics.student}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>Per-subject attendance breakdown</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {Object.entries(analytics.analytics).map(([subject, data]) => (
                  <div key={subject} className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f5' }}>{subject}</div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>{data.total} classes held</div>
                      </div>
                      <CircleProgress percentage={data.percentage} />
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                      <div style={{ flex: 1, padding: '10px', background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', fontFamily: 'JetBrains Mono' }}>{data.present}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>Present</div>
                      </div>
                      <div style={{ flex: 1, padding: '10px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono' }}>{data.absent}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>Absent</div>
                      </div>
                    </div>

                    {/* 75% warning */}
                    {data.percentage < 75 && data.total > 0 && (
                      <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 7, marginBottom: 12, fontSize: 12, color: '#ef4444' }}>
                        ⚠️ Below 75% threshold
                      </div>
                    )}

                    {/* History toggle */}
                    {data.history.length > 0 && (
                      <>
                        <button
                          onClick={() => toggleHistory(subject)}
                          style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 7, color: '#888', fontSize: 12, cursor: 'pointer', textAlign: 'center' }}
                        >
                          {historyOpen[subject] ? '▲ Hide' : '▼ Show'} Attendance History
                        </button>

                        {historyOpen[subject] && (
                          <div style={{ marginTop: 10, maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {data.history.map((h, j) => (
                              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, background: '#0d0d0d' }}>
                                <span style={{ fontSize: 12, color: '#888', fontFamily: 'JetBrains Mono' }}>
                                  {new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                                  background: h.status === 'present' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                  color: h.status === 'present' ? '#22c55e' : '#ef4444',
                                  border: `1px solid ${h.status === 'present' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                                }}>
                                  {h.status === 'present' ? '✓ Present' : '✗ Absent'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Daily View */
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Subject</label>
            <select className="input-dark" value={dailySubject} onChange={e => setDailySubject(e.target.value)} style={{ maxWidth: 280 }}>
              {cls?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {dailyRecords.length === 0 ? (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ color: '#555' }}>No attendance recorded for {dailySubject} yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {dailyRecords.map((rec, i) => {
                const present = rec.records.filter(r => r.status === 'present');
                const absent = rec.records.filter(r => r.status === 'absent');
                const pct = rec.records.length > 0 ? Math.round((present.length / rec.records.length) * 100) : 0;

                return (
                  <div key={i} className="glass-card" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#f5f5f5' }}>
                          {new Date(rec.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{rec.records.length} students recorded</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CircleProgress percentage={pct} size={60} stroke={5} />
                        <div>
                          <div style={{ fontSize: 12, color: '#22c55e' }}>{present.length} present</div>
                          <div style={{ fontSize: 12, color: '#ef4444' }}>{absent.length} absent</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', transition: 'width 0.6s ease', borderRadius: 2 }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>
                          Present ({present.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {present.length === 0 ? <span style={{ color: '#444', fontSize: 12 }}>—</span> :
                            present.map((r, j) => (
                              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#d4d4d4' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                                {r.student}
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>
                          Absent ({absent.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {absent.length === 0 ? <span style={{ color: '#444', fontSize: 12 }}>—</span> :
                            absent.map((r, j) => (
                              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#d4d4d4' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                                {r.student}
                              </div>
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
