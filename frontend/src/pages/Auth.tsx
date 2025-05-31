import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(''); // Default to empty string to enforce selection
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [roleError, setRoleError] = useState(''); // New state for role validation
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validate email
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
    } else if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  // Validate password and calculate strength
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate before submission
    validateEmail(email);
    validatePassword(password);
    if (!isLogin && !role) {
      setRoleError('Please select a role');
    } else {
      setRoleError('');
    }

    if (emailError || passwordError || roleError || (!isLogin && !name)) {
      return;
    }

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:5000/api/users/login', { email, password }, {
          withCredentials: true,
        });
        const { token } = response.data;
        if (token) {
          localStorage.setItem('token', token);
          navigate('/');
        } else {
          throw new Error('Token not received');
        }
      } else {
        await axios.post('http://localhost:5000/api/users/register', { name, email, password, role });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
    }
  };

  const toggleForm = () => {
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setRole('');
    setEmailError('');
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
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition duration-200"
                    required
                  />
                </div>
              )}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Email - eg: hari@example.com"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition duration-200"
                  required
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Password - eg: Password123"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition duration-200"
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
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 appearance-none cursor-pointer"
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
                className="w-full bg-primary-600 text-white p-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-200"
              >
                {isLogin ? 'Login' : 'Register'}
              </button>
            </form>
            <p className="mt-4 sm:mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={toggleForm}
                className="text-primary-600 hover:text-primary-700 font-medium focus:outline-none transition duration-200"
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