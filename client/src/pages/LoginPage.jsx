import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Lock, Mail, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/motion/AnimatedPage';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [teacherCode, setTeacherCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setEmailError("");

  // Accepter uniquement ces domaines
  const allowedDomains = ["gmail.com", "learnify.com", "email.com", "hotmail.com"];
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@(.+)$/;
  const match = email.match(emailRegex);
  const domain = match ? match[1].toLowerCase() : "";
  if (!match || !allowedDomains.includes(domain)) {
    setEmailError("Invalid Format — utilisez : @gmail.com, @learnify.com, @hotmail.com ou @email.com");
    return;
  }

  try {
    if (isLogin) {
      // 🔵 LOGIN
     const userData = await login(email, password);
    if (userData.role === "teacher") navigate("/teacher-dashboard");
    else navigate("/");

    } else {
  //  SIGNUP

  await signup(email, password, firstName, lastName, role, teacherCode);

  setIsLogin(true);
  setSuccess("Account created! You can login now ✅");
}

  } catch (err) {
    setError(err.message);
  }
};

  return (
    <AnimatedPage className="min-h-screen">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1.05fr_0.95fr]">
          <div className="text-white">
            <span className="badge mb-6 inline-flex items-center gap-2 bg-white/10 text-white">
              <Shield size={14} /> Secure learning workspace
            </span>
            <h1 className="text-5xl font-semibold leading-tight">Welcome to Learnify</h1>
            <p className="mt-6 text-lg text-slate-200">
              The modern platform for focused learning, certification, and instructor collaboration.
            </p>
            <div className="mt-8 space-y-3 text-sm text-slate-300">
              <p>Trusted by ambitious learners in 40+ countries.</p>
              <p>Track mastery, unlock achievements, and share credentials.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="surface rounded-3xl p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {isLogin ? 'Sign in' : 'Create account'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {isLogin ? 'Welcome back to your workspace.' : 'Start your learning journey.'}
                </p>
              </div>
              <div className="flex rounded-2xl border border-slate-200/60 bg-white/70 p-1 text-xs font-semibold text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`rounded-2xl px-3 py-1.5 transition ${isLogin ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : ''}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`rounded-2xl px-3 py-1.5 transition ${!isLogin ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : ''}`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="First name"
                    icon={User}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                  <Input
                    label="Last name"
                    icon={User}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              )}

              {!isLogin && role === 'teacher' && (
                <Input
                  label="Teacher access code"
                  icon={Lock}
                  type="password"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  placeholder="Enter access code"
                />
              )}

              <Input
                label="Email address"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                error={emailError}
              />

              <Input
                label="Password"
                icon={Lock}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />

              <div>
                <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">I am a...</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`btn btn-md ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`btn btn-md ${role === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200/60 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {success}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full">
                {isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={18} />
              </Button>
            </form>

            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              By signing in you agree to our Terms, Privacy Policy, and Community Code.
            </p>
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
}