import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-5xl font-bold text-white">Learnify</h1>
          <p className="text-blue-100">Learn Anything, Become Anything</p>
        </div>

        {/* Auth Card */}
        <div className="p-8 bg-white rounded-lg shadow-2xl dark:bg-gray-800">
          {/* Tab Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up Only) */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute text-gray-400 left-3 top-3" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute text-gray-400 left-3 top-3" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              
            )}
            
            {!isLogin && role === 'teacher' && (
            <div>
              <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
                Code professeur
              </label>
             <div className="relative">
               <Lock size={20} className="absolute text-gray-400 left-3 top-3" />
               <input
                 type="password"
                 value={teacherCode}
                 onChange={(e) => setTeacherCode(e.target.value)}
                 placeholder="Code secret prof"
                 className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
               />
             </div>
           </div> 
           )}

            {/* Email */}
            <div>
              <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute text-gray-400 left-3 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute text-gray-400 left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block mb-3 font-bold text-gray-700 dark:text-gray-300">
                I am a...
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-3 rounded-lg font-bold transition border-2 ${
                    role === 'student'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-blue-500'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex-1 py-3 rounded-lg font-bold transition border-2 ${
                    role === 'teacher'
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-purple-500'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 text-red-800 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
                {error}
              </div>
            )}

              {/* Success Message */}

              {success && (
              <div className="px-4 py-3 text-green-800 bg-green-100 border border-green-400 rounded dark:bg-green-900 dark:border-green-700 dark:text-green-200">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="flex items-center justify-center w-full gap-2 py-3 mt-6 font-bold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {isLogin ? 'Login' : 'Create Account'}
              <ArrowRight size={20} />
            </button>


          </form>

          {/* Footer */}
          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}