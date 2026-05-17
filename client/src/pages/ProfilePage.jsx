import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Award, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">{error}</p>
    </div>
  );

  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
          {/* Profile Header */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900" />

          <div className="px-8 pb-8">
            {/* Avatar + Info */}
            <div className="flex flex-col items-start gap-6 mb-8 -mt-16 md:flex-row md:items-end">
              <div className="flex items-center justify-center w-32 h-32 text-4xl font-bold text-white bg-blue-600 border-4 border-white rounded-full dark:border-gray-800">
                {profile?.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{fullName || 'No name'}</h1>
                <p className="mt-1 text-gray-600 capitalize dark:text-gray-400">{profile?.role}</p>
              </div>
            </div>

            {/* Edit Form */}
            {editing ? (
              <div className="p-6 mb-8 space-y-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                    <input
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                    <input
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    maxLength={250}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="px-6 py-2 font-bold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="px-6 py-2 font-bold text-gray-900 transition border-2 border-gray-300 rounded-lg dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{fullName || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{profile?.email}</p>
                    </div>
                  </div>
                  {profile?.bio && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Bio</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{profile.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Learning Stats</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <Award size={20} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Member since</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/30">
                    <BookOpen size={20} className="text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enrolled courses</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{enrolledCourses.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrolled Courses */}
            {enrolledCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">My Courses</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {enrolledCourses.map(course => (
                    <div key={course._id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{course.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Button */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-6 py-3 font-bold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Settings size={18} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}