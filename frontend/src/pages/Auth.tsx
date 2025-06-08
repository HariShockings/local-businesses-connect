import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [emailOrUsernameError, setEmailOrUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [roleError, setRoleError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateEmailOrUsername = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!value) {
      setEmailOrUsernameError('Email or username is required');
    } else if (!emailRegex.test(value) && !usernameRegex.test(value)) {
      setEmailOrUsernameError('Please enter a valid email or username (letters, numbers, underscores)');
    } else {
      setEmailOrUsernameError('');
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      setPasswordStrength('');
      return;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }

    let strength = 'Weak';
    if (value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value)) {
      strength = 'Strong';
    } else if (value.length >= 6 && (/[A-Z]/.test(value) || /[0-9]/.test(value))) {
      strength = 'Medium';
    }
    setPasswordStrength(strength);
  };

  const handleEmailOrUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailOrUsername(value);
    validateEmailOrUsername(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let device = 'Unknown Device';
    if (/Mobi|Android|iPhone|iPad|iPod/.test(userAgent)) {
      device = /Android/.test(userAgent) ? 'Android Device' : 'iOS Device';
    } else if (/Macintosh|Mac OS X/.test(userAgent)) {
      device = 'Mac';
    } else if (/Windows/.test(userAgent)) {
      device = 'Windows PC';
    }
    return device;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    validateEmailOrUsername(emailOrUsername);
    validatePassword(password);
    if (!isLogin && !role) {
      setRoleError('Please select a role');
    } else {
      setRoleError('');
    }

    if (emailOrUsernameError || passwordError || roleError || (!isLogin && !name)) {
      return;
    }

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:5000/api/users/login', {
          email: emailOrUsername,
          password,
          device: getDeviceInfo(),
        }, {
          withCredentials: true,
        });
        const { token, role } = response.data;
        if (token) {
          localStorage.setItem('token', token);
          if (role === 'user') {
            navigate('/');
          } else {
            navigate('/dashboard/');
          }
        } else {
          throw new Error('Token not received');
        }
      } else {
        await axios.post('http://localhost:5000/api/users/register', {
          name,
          username: username || undefined,
          email: emailOrUsername,
          password,
          role,
        });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
    }
  };

  const toggleForm = () => {
    setError('');
    setEmailOrUsername('');
    setPassword('');
    setName('');
    setUsername('');
    setRole('');
    setEmailOrUsernameError('');
    setPasswordError('');
    setPasswordStrength('');
    setRoleError('');
    setIsLogin(!isLogin);
  };

  const slideVariants = {
    initial: (isLogin: boolean) => ({ x: isLogin ? 300 : -300, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (isLogin: boolean) => ({ x: isLogin ? -300 : 300, opacity: 0 }),
  };

  const flipVariants = {
    initial: (isLogin: boolean) => ({ rotateY: isLogin ? 90 : -90, opacity: 0 }),
    animate: { rotateY: 0, opacity: 1 },
    exit: (isLogin: boolean) => ({ rotateY: isLogin ? -90 : 90, opacity: 0 }),
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md mx-4 sm:mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            custom={isLogin}
            variants={isMobile ? flipVariants : slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="p-6 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-center mb-4 sm:mb-6"
              >
                {error}
              </motion.p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name - eg: Hariharan"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
              )}
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username (optional) - eg: hari123"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
              )}
              <div>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={handleEmailOrUsernameChange}
                  placeholder={isLogin ? "Email or Username - eg: hari@example.com or hari123" : "Email - eg: hari@example.com"}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
                {emailOrUsernameError && (
                  <p className="mt-1 text-xs text-red-500">{emailOrUsernameError}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Password - eg: Password123"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                  minLength={isLogin ? undefined : 6}
                />
                {passwordError && (
                  <p className="mt-1 text-xs text-red-500">{passwordError}</p>
                )}
                {password && (
                  <p className={`mt-1 text-xs ${
                    passwordStrength === 'Weak' ? 'text-red-500' :
                    passwordStrength === 'Medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    Password Strength: {passwordStrength}
                  </p>
                )}
              </div>
              {!isLogin && (
                <div>
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setRoleError('');
                    }}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Role</option>
                    <option value="user">User</option>
                    <option value="business_owner">Business Owner</option>
                  </select>
                  {roleError && (
                    <p className="mt-1 text-xs text-red-500">{roleError}</p>
                  )}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 dark:bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-200"
              >
                {isLogin ? 'Login' : 'Register'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-gray-600 dark:bg-gray-700 text-white p-3 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-200 mt-4"
              >
                Go to Store
              </button>
            </form>
            <p className="mt-4 sm:mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={toggleForm}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium focus:outline-none transition duration-200"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Auth;