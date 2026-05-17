import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Trash2, Edit, Loader2, CheckCircle, XCircle,
  BookOpen, Users, Layers, X, Save, ChevronDown, ChevronUp,
  GraduationCap, FileText, Upload, Film, File, Eye, EyeOff, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const MAX_SIZE_MB = 200;

function getToken() { return localStorage.getItem('token'); }

// apiFetch standard (JSON)
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// apiFetch pour FormData (upload fichier)
async function apiUpload(path, formData, method = 'POST') {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

//  Toast 
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white font-semibold text-sm
      ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
      {msg}
    </div>
  );
}

//  Modal 
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white shadow-2xl dark:bg-gray-800 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-start justify-between p-6 pb-4 bg-white border-b border-gray-100 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div className="px-4 py-3 mb-4 text-sm text-red-700 rounded-lg bg-red-50 dark:bg-red-900/30 dark:text-red-300">
      {msg}
    </div>
  );
}

//  File Upload Zone 
function FileUploadZone({ file, onChange, existingFileUrl, existingFileType }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  const accept = 'application/pdf,video/mp4,video/webm,video/ogg,video/quicktime';

  const validate = (f) => {
    if (!f) return null;
    const allowed = ['application/pdf', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowed.includes(f.type)) return 'Only PDF and video files (mp4, webm, ogg, mov) are allowed.';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File too large. Max ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const handleFile = (f) => {
    const err = validate(f);
    if (err) { alert(err); return; }
    onChange(f);
  };

  const isPdf = file ? file.type === 'application/pdf' : existingFileType === 'pdf';
  const isVideo = file ? file.type.startsWith('video/') : existingFileType === 'video';
  const label = file ? file.name : existingFileUrl ? `Current ${existingFileType?.toUpperCase()} file` : null;

  return (
    <div>
      <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Attach file <span className="font-normal text-gray-400">(PDF or video, max {MAX_SIZE_MB}MB)</span>
      </label>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition
          ${dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 bg-gray-50 dark:bg-gray-700/40'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />

        {label ? (
          <div className="flex items-center gap-3 text-center">
            {isPdf
              ? <File size={28} className="flex-shrink-0 text-red-500" />
              : isVideo
                ? <Film size={28} className="flex-shrink-0 text-purple-500" />
                : <Upload size={28} className="flex-shrink-0 text-gray-400" />
            }
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700 break-all dark:text-gray-300">{label}</p>
              {file && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); }}
              className="p-1 ml-auto text-gray-400 transition rounded hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={24} className="text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drop file here or <span className="font-semibold text-blue-600 dark:text-blue-400">browse</span>
            </p>
            <p className="text-xs text-gray-400">PDF, MP4, WebM, MOV — max {MAX_SIZE_MB}MB</p>
          </>
        )}
      </div>
    </div>
  );
}

//  File Viewer (inline dans la lesson) 
function FileViewer({ fileType, lessonId }) {
  const [show, setShow] = useState(false);
  if (!fileType || !lessonId) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShow(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
          {show ? 'Hide' : 'Preview'} {fileType?.toUpperCase()}
        </button>
        <a
          href={`${API_BASE}/courses/lesson/${lessonId}/file?token=${getToken()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-blue-500 hover:underline"
        >
          <Eye size={12} /> Open in new tab
        </a>
      </div>

      {show && (
        <div className="mt-2 overflow-hidden border border-gray-200 rounded-xl dark:border-gray-600">
          {fileType === 'pdf' ? (
            <iframe
              src={`${API_BASE}/courses/lesson/${lessonId}/file?token=${getToken()}`}
              title="PDF preview"
              className="w-full"
              style={{ height: '480px' }}
            />
          ) : (
            <video
              src={fileUrl}
              controls
              className="w-full bg-black max-h-72"
            />
          )}
        </div>
      )}
    </div>
  );
}

//  Add Lesson Modal 
function AddLessonModal({ course, onClose, onAdded }) {
  const [form, setForm] = useState({ title: '', content: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('courseId', course._id || course.id);
      if (file) formData.append('file', file);

      const res = await apiUpload('/courses/addLesson', formData, 'POST');
      onAdded(res.lesson ?? res);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Lesson" subtitle={`Course: ${course.title}`} onClose={onClose}>
      <ErrorBox msg={error} />
      <div className="space-y-4">
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Lesson Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Introduction to React Hooks"
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Brief description of this lesson…"
            rows={3}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 resize-none rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <FileUploadZone file={file} onChange={setFile} />
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-700 transition bg-gray-100 rounded-xl dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading} className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {loading ? (file ? 'Uploading…' : 'Adding…') : 'Add Lesson'}
        </button>
      </div>
    </Modal>
  );
}

//  Edit Lesson Modal 
function EditLessonModal({ lesson, onClose, onUpdated }) {
  const [form, setForm] = useState({ title: lesson.title || '', content: lesson.content || '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const lessonId = lesson._id || lesson.id;
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      if (file) formData.append('file', file);

      const res = await apiUpload(`/courses/updateLesson/${lessonId}`, formData, 'PATCH');
      onUpdated(res.lesson ?? { ...lesson, ...form });
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Lesson" subtitle={`Editing: ${lesson.title}`} onClose={onClose}>
      <ErrorBox msg={error} />
      <div className="space-y-4">
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Lesson Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 resize-none rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <FileUploadZone
          file={file}
          onChange={setFile}
          existingFileUrl={lesson.fileUrl}
          existingFileType={lesson.fileType}
        />

        {/* Preview fichier existant si pas de nouveau */}
        {!file && lesson.fileType && (
          <FileViewer fileType={lesson.fileType} lessonId={lesson._id || lesson.id} />
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-700 transition bg-gray-100 rounded-xl dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading} className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? (file ? 'Uploading…' : 'Saving…') : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}

//  Edit Course Modal 
function EditCourseModal({ course, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    category: course.category || 'Web Development',
    level: course.level || 'Beginner',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const courseId = course._id || course.id;
      const res = await apiFetch(`/courses/updateCourse/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      onUpdated(res.course ?? { ...course, ...form });
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Course" subtitle={`Editing: ${course.title}`} onClose={onClose}>
      <ErrorBox msg={error} />
      <div className="space-y-4">
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Course Title</label>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 resize-none rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Web Development','Mobile Apps','Data Science','Cloud Computing','Artificial Intelligence','Cybersecurity'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Level</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-700 transition bg-gray-100 rounded-xl dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}

//  Create Course Form 
function CreateCourseForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'Web Development', level: 'Beginner' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/courses/createCourse', { method: 'POST', body: JSON.stringify(form) });
      onCreated(res.course ?? res);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 mb-10 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Course</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"><X size={18} /></button>
      </div>
      <ErrorBox msg={error} />
      <div className="space-y-4">
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Course Title *</label>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter course title"
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Description *</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Course description" rows={3}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 resize-none rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Web Development','Mobile Apps','Data Science','Cloud Computing','Artificial Intelligence','Cybersecurity'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Level</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-700 transition bg-gray-100 rounded-xl dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {loading ? 'Creating…' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

//  Lesson Row 
function LessonRow({ lesson, onDelete, onEdit }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this lesson?')) return;
    setDeleting(true);
    try {
      await apiFetch(`/courses/deleteLesson/${lesson._id || lesson.id}`, { method: 'DELETE' });
      onDelete(lesson._id || lesson.id);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const fileType = lesson.fileType;

  return (
    <div className="overflow-hidden border border-gray-100 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center min-w-0 gap-3">
          {fileType === 'pdf'
            ? <File size={16} className="flex-shrink-0 text-red-500" />
            : fileType === 'video'
              ? <Film size={16} className="flex-shrink-0 text-purple-500" />
              : <FileText size={16} className="flex-shrink-0 text-blue-500" />
          }
          <div className="min-w-0">
            <span className="block text-sm font-medium text-gray-800 truncate dark:text-gray-200">{lesson.title}</span>
            {fileType && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 inline-block
                ${fileType === 'pdf' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                {fileType.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 gap-2 ml-3">
          <button onClick={() => onEdit(lesson)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" title="Edit">
            <Edit size={14} />
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50" title="Delete">
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      {/* Inline preview — check fileType (fileData stored in MongoDB, served via backend) */}
      {lesson.fileType && (
        <div className="px-4 pb-3">
          <FileViewer fileType={lesson.fileType} lessonId={lesson._id || lesson.id} />
        </div>
      )}
    </div>
  );
}


//  Create Quiz Modal 
function CreateQuizModal({ course, onClose, notify }) {
  const emptyQ = () => ({ question: '', options: ['', '', '', ''], correct: 0 });
  const [title, setTitle] = useState(`${course.title} — Quiz`);
  const [passingScore, setPassingScore] = useState(80);
  const [questions, setQuestions] = useState([emptyQ()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateQ = (qi, field, val) => setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [field]: val } : q));
  const updateOption = (qi, oi, val) => setQuestions(qs => qs.map((q, i) => i !== qi ? q : { ...q, options: q.options.map((o, j) => j === oi ? val : o) }));
  const addQ = () => setQuestions(qs => [...qs, emptyQ()]);
  const removeQ = (qi) => setQuestions(qs => qs.filter((_, i) => i !== qi));

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title required.'); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { setError(`Question ${i + 1} text is empty.`); return; }
      if (q.options.some(o => !o.trim())) { setError(`All options in question ${i + 1} must be filled.`); return; }
    }
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        courseId: course._id || course.id,
        title,
        passingScore,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correct,
        })),
      };
      const res = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      notify('Quiz created!');
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create Quiz" subtitle={`Course: ${course.title}`} onClose={onClose}>
      <ErrorBox msg={error} />
      <div className="space-y-4">
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Quiz Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Passing score: <span className="text-purple-600">{passingScore}%</span>
          </label>
          <input type="range" min={0} max={100} value={passingScore} onChange={e => setPassingScore(+e.target.value)}
            className="w-full" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {questions.map((q, qi) => (
          <div key={qi} className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQ(qi)} className="p-1 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
                  <X size={14} />
                </button>
              )}
            </div>
            <input type="text" placeholder="Question text…" value={q.question}
              onChange={e => updateQ(qi, 'question', e.target.value)}
              className="w-full px-3 py-2 mb-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${qi}`} checked={q.correct === oi}
                    onChange={() => updateQ(qi, 'correct', oi)}
                    className="flex-shrink-0 accent-purple-600" title="Mark as correct answer" />
                  <input type="text" placeholder={`Option ${oi + 1}`} value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white
                      ${q.correct === oi
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500'
                        : 'border-gray-200 dark:border-gray-600 bg-white'}`} />
                  {q.correct === oi && <span className="text-xs font-bold text-purple-600 dark:text-purple-400">✓</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={addQ}
        className="flex items-center gap-1.5 mt-4 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
        <Plus size={14} /> Add question
      </button>

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-700 transition bg-gray-100 rounded-xl dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? 'Saving…' : 'Save Quiz'}
        </button>
      </div>
    </Modal>
  );
}


function CourseCard({ course, onDelete, onEdit, onLessonAdded, notify }) {
  const [expanded, setExpanded] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const courseId = course._id || course.id;

  const fetchLessons = useCallback(async () => {
    setLoadingLessons(true);
    try {
      const data = await apiFetch(`/courses/${courseId}/lessons`);
      setLessons(data.lessons ?? data);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setLoadingLessons(false);
    }
  }, [courseId]);

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && lessons.length === 0) fetchLessons();
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setDeletingCourse(true);
    try {
      await apiFetch(`/courses/deleteCourse/${courseId}`, { method: 'DELETE' });
      onDelete(courseId);
      notify('Course deleted.');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setDeletingCourse(false);
    }
  };

  return (
    <>
      {addLessonOpen && <AddLessonModal course={course} onClose={() => setAddLessonOpen(false)} onAdded={lesson => { setLessons(p => [...p, lesson]); onLessonAdded(courseId); notify('Lesson added!'); }} />}
      {editLesson && <EditLessonModal lesson={editLesson} onClose={() => setEditLesson(null)} onUpdated={updated => { setLessons(p => p.map(l => (l._id||l.id) === (updated._id||updated.id) ? updated : l)); notify('Lesson updated!'); }} />}
      {quizOpen && <CreateQuizModal course={course} onClose={() => setQuizOpen(false)} notify={notify} />}

      <div className="transition-shadow bg-white border border-transparent shadow-md dark:bg-gray-800 rounded-2xl hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="min-w-0 mr-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
                {course.level && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 capitalize">{course.level}</span>}
              </div>
              {course.category && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{course.category}</p>}
              {course.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{course.description}</p>}
              {course.createdAt && <p className="mt-1 text-xs text-gray-400">Created {new Date(course.createdAt).toLocaleDateString()}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Students', value: course.studentsEnrolled?.length ?? 0, icon: Users },
              { label: 'Lessons', value: course.lessons?.length ?? 0, icon: BookOpen },
              { label: 'Passed', value: course.studentsPassed?.length ?? 0, icon: Layers },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <Icon size={16} className="flex-shrink-0 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => onEdit(course)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition">
              <Edit size={14} /> Edit
            </button>
            <button onClick={() => setAddLessonOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-xl hover:bg-blue-100 transition">
              <Plus size={14} /> Add Lesson
            </button>
            <button onClick={() => setQuizOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 rounded-xl hover:bg-purple-100 transition">
              <ClipboardList size={14} /> Quiz
            </button>
            <button onClick={toggleExpand} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Hide Lessons' : 'View Lessons'}
            </button>
            <button onClick={handleDeleteCourse} disabled={deletingCourse} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-xl hover:bg-red-100 disabled:opacity-50 transition ml-auto">
              {deletingCourse ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          </div>
        </div>

        {expanded && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Lessons</h4>
              <span className="text-xs text-gray-400">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
            </div>
            {loadingLessons ? (
              <div className="flex items-center gap-2 py-4 text-gray-400"><Loader2 size={16} className="animate-spin" /><span className="text-sm">Loading…</span></div>
            ) : lessons.length === 0 ? (
              <div className="py-6 text-center text-gray-400"><BookOpen size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No lessons yet.</p></div>
            ) : (
              <div className="space-y-2">
                {lessons.map(lesson => (
                  <LessonRow key={lesson._id || lesson.id} lesson={lesson}
                    onDelete={id => { setLessons(p => p.filter(l => (l._id||l.id) !== id)); notify('Lesson deleted.'); }}
                    onEdit={setEditLesson}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

//  Main 
export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/courses/teacher/me');
        setCourses(Array.isArray(data) ? data : data.courses ?? []);
      } catch (e) {
        setFetchError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalStudents = courses.reduce((s, c) => s + (c.studentsEnrolled?.length ?? 0), 0);
  const totalLessons  = courses.reduce((s, c) => s + (c.lessons?.length ?? 0), 0);

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {editCourse && (
        <EditCourseModal
          course={editCourse}
          onClose={() => setEditCourse(null)}
          onUpdated={updated => {
            setCourses(p => p.map(c => (c._id||c.id) === (updated._id||updated.id) ? { ...c, ...updated } : c));
            setEditCourse(null);
            notify('Course updated!');
          }}
        />
      )}

      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl"><GraduationCap size={24} className="text-white" /></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome{user?.firstName ? `, ${user.firstName}` : ''} — manage your courses
              </p>
            </div>
          </div>
          <button onClick={() => setShowNewCourse(v => !v)} className="flex items-center gap-2 px-5 py-2.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm">
            <Plus size={18} /> New Course
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 mb-10 md:grid-cols-3">
          {[
            { label: 'Total Courses',  value: courses.length,  icon: BookOpen, color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Total Students', value: totalStudents,   icon: Users,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Total Lessons',  value: totalLessons,    icon: Layers,   color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
              <div className={`p-3 rounded-xl ${bg}`}><Icon size={22} className={color} /></div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {showNewCourse && (
          <CreateCourseForm onClose={() => setShowNewCourse(false)} onCreated={c => { setCourses(p => [c, ...p]); notify('Course created!'); }} />
        )}

        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Courses</h2>

          {loading && <div className="flex items-center justify-center gap-3 py-20 text-gray-400"><Loader2 size={26} className="animate-spin" /><span>Loading courses…</span></div>}
          {fetchError && !loading && <div className="px-6 py-5 text-red-700 rounded-2xl bg-red-50 dark:bg-red-900/30 dark:text-red-300">⚠️ {fetchError}</div>}
          {!loading && !fetchError && courses.length === 0 && (
            <div className="py-20 text-center text-gray-400"><BookOpen size={48} className="mx-auto mb-4 opacity-30" /><p>No courses yet. Create your first one!</p></div>
          )}

          {courses.map(course => (
            <CourseCard key={course._id || course.id} course={course}
              onDelete={id => setCourses(p => p.filter(c => (c._id||c.id) !== id))}
              onEdit={setEditCourse}
              onLessonAdded={id => setCourses(p => p.map(c => (c._id||c.id) === id ? { ...c, lessons: [...(c.lessons??[]), {}] } : c))}
              notify={notify}
            />
          ))}
        </div>
      </div>
    </div>
  );
}