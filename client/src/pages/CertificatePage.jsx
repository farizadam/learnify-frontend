import { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Trophy, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedPage from '../components/motion/AnimatedPage';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
function getToken() { return localStorage.getItem('token'); }

async function apiFetch(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Certificate Canvas Generator ──────────────────────────────────────────────
function drawCertificate(canvas, { studentName, courseTitle, instructorName, date }) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.fillStyle = '#fdfaf5';
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Inner border
  ctx.strokeStyle = '#e8d5a3';
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  // Corner decorations
  const corners = [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50]];
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a84c';
    ctx.fill();
  });

  // Header band
  const grad = ctx.createLinearGradient(0, 60, 0, 150);
  grad.addColorStop(0, '#1e3a8a');
  grad.addColorStop(1, '#1e40af');
  ctx.fillStyle = grad;
  ctx.fillRect(40, 60, W - 80, 90);

  // Trophy icon (drawn as text emoji on canvas)
  ctx.font = '40px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', W / 2, 120);

  // "CERTIFICATE OF COMPLETION"
  ctx.fillStyle = '#c9a84c';
  ctx.font = `bold 22px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 185);

  // Decorative line
  ctx.beginPath();
  ctx.moveTo(100, 200);
  ctx.lineTo(W - 100, 200);
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // "This is to certify that"
  ctx.fillStyle = '#64748b';
  ctx.font = `italic 16px Georgia, serif`;
  ctx.fillText('This is to certify that', W / 2, 240);

  // Student name
  ctx.fillStyle = '#1e3a8a';
  ctx.font = `bold 36px Georgia, serif`;
  ctx.fillText(studentName, W / 2, 295);

  // Underline name
  const nameWidth = ctx.measureText(studentName).width;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameWidth / 2, 305);
  ctx.lineTo(W / 2 + nameWidth / 2, 305);
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // "has successfully completed"
  ctx.fillStyle = '#64748b';
  ctx.font = `italic 16px Georgia, serif`;
  ctx.fillText('has successfully completed the course', W / 2, 340);

  // Course title
  ctx.fillStyle = '#1e3a8a';
  ctx.font = `bold 24px Georgia, serif`;
  // Wrap if too long
  const maxWidth = W - 160;
  if (ctx.measureText(courseTitle).width > maxWidth) {
    ctx.font = `bold 18px Georgia, serif`;
  }
  ctx.fillText(courseTitle, W / 2, 385);

  // Decorative line
  ctx.beginPath();
  ctx.moveTo(100, 410);
  ctx.lineTo(W - 100, 410);
  ctx.strokeStyle = '#e8d5a3';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Date and instructor side by side
  ctx.font = `14px Georgia, serif`;
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'left';
  ctx.fillText(`Date: ${date}`, 100, 450);
  ctx.textAlign = 'right';
  ctx.fillText(`Instructor: ${instructorName}`, W - 100, 450);

  // Signature lines
  ctx.beginPath();
  ctx.moveTo(100, 470);
  ctx.lineTo(250, 470);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(W - 250, 470);
  ctx.lineTo(W - 100, 470);
  ctx.stroke();

  ctx.font = `12px Georgia, serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText('Student', 175, 488);
  ctx.fillText('Instructor', W - 175, 488);

  // Learnify watermark
  ctx.font = `bold 13px Georgia, serif`;
  ctx.fillStyle = '#c9a84c';
  ctx.textAlign = 'center';
  ctx.fillText('LEARNIFY', W / 2, H - 45);
  ctx.font = `11px Georgia, serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('learnify.app', W / 2, H - 28);
}

// ── Certificate Card ───────────────────────────────────────────────────────────
function CertCard({ cert, studentName }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawCertificate(canvasRef.current, {
        studentName,
        courseTitle: cert.course,
        instructorName: cert.instructor,
        date: new Date(cert.completionDate).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
      });
    }
  }, [cert, studentName]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `certificate-${cert.course.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="surface overflow-hidden rounded-3xl transition hover:-translate-y-1">
      {/* Canvas preview */}
      <div className="bg-slate-100 p-3 dark:bg-slate-950">
        <canvas
          ref={canvasRef}
          width={700}
          height={500}
          className="w-full rounded-lg"
          style={{ aspectRatio: '7/5' }}
        />
      </div>

      {/* Details */}
      <div className="p-5">
        <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-white line-clamp-1">{cert.course}</h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Instructor: {cert.instructor} · {new Date(cert.completionDate).toLocaleDateString()}
        </p>

        <button
          onClick={handleDownload}
          className="btn btn-primary btn-md w-full"
        >
          <Download size={18} />
          Download Certificate
        </button>
      </div>
    </div>
  );
}

// Main Page
export default function CertificatePage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Student';

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/courses');
        const list = Array.isArray(data) ? data : [];
        const userId = user?._id || user?.id;

        const passed = list
          .filter(c => c.studentsPassed?.some(s => (s._id || s) === userId))
          .map(course => ({
            id: course._id || course.id,
            course: course.title,
            instructor: course.instructor?.firstName
              ? `${course.instructor.firstName} ${course.instructor.lastName}`
              : 'Instructor',
            completionDate: course.updatedAt || course.createdAt || new Date().toISOString(),
            courseId: course._id || course.id,
          }));

        setCertificates(passed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return (
    <AnimatedPage className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={36} className="text-sky-500 animate-spin" />
      </div>
    </AnimatedPage>
  );

  return (
    <AnimatedPage className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          title="Certificates"
          subtitle={`${certificates.length} certificate${certificates.length !== 1 ? 's' : ''} earned`}
          action={
            <div className="flex items-center gap-2 rounded-2xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
              <Award size={14} /> Verified achievements
            </div>
          }
        />

        <div className="mt-10">
          {certificates.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No certificates yet"
              message="Complete a course and pass the quiz with 80%+ to unlock your certificate."
              action={
                <Link to="/courses" className="btn btn-primary btn-md">
                  Browse courses
                </Link>
              }
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {certificates.map(cert => (
                <CertCard key={cert.id} cert={cert} studentName={studentName} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}