import { useState, useEffect } from 'react';
import { BookOpen, Mail, MapPin, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedPage from '../components/motion/AnimatedPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/users/me/courses`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([userData, coursesData]) => {
        setProfile(userData);
        setForm({ firstName: userData.firstName || '', lastName: userData.lastName || '', bio: userData.bio || '' });
        setEnrolledCourses(coursesData.enrolledCourses || []);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AnimatedPage className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center text-slate-500">Loading profile...</div>
    </AnimatedPage>
  );

  if (error) return (
    <AnimatedPage className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center text-rose-500">{error}</div>
    </AnimatedPage>
  );

  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';

  return (
    <AnimatedPage className="min-h-screen">
      <DashboardLayout
        title="Profile settings"
        subtitle="Update your personal details and manage your learning profile."
        actions={!editing ? (
          <Button onClick={() => setEditing(true)} size="sm">
            <Settings size={16} /> Edit profile
          </Button>
        ) : null}
      >
        <div className="surface overflow-hidden rounded-3xl">
          <div className="h-28 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />

          <div className="px-8 pb-8">
            <div className="-mt-12 flex flex-col items-start gap-6 md:flex-row md:items-end">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 text-3xl font-semibold text-white">
                {profile?.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{fullName || 'No name'}</h1>
                <p className="mt-1 text-sm capitalize text-slate-500 dark:text-slate-400">{profile?.role}</p>
              </div>
            </div>

            {editing ? (
              <div className="mt-8 rounded-2xl border border-slate-200/60 bg-white/70 p-6 dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="First name"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  />
                  <Input
                    label="Last name"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Bio"
                    as="textarea"
                    rows={3}
                    maxLength={250}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    className="resize-none"
                  />
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={handleSave} disabled={saving} size="md">
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={() => setEditing(false)} variant="secondary" size="md">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal information</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <User size={18} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Full name</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{fullName || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <Mail size={18} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{profile?.email}</p>
                    </div>
                  </div>
                  {profile?.bio && (
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                      <MapPin size={18} className="mt-0.5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Bio</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{profile.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Learning stats</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <Settings size={18} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Member since</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <BookOpen size={18} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Enrolled courses</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{enrolledCourses.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {enrolledCourses.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My courses</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {enrolledCourses.map(course => (
                    <div key={course._id} className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AnimatedPage>
  );
}