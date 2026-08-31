import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken, setUser, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const sendOtp = async () => {
    setError('');
    setOtpMessage('');

    if (!form.email || !form.email.trim()) {
      setError('Email is required to send OTP');
      return;
    }

    try {
      const res = await axios.post('/api/auth/send-otp', {
        email: form.email,
      });
      setOtpSent(true);
      setOtpMessage(
        res.data.demoOtp
          ? `${res.data.message}. Demo OTP: ${res.data.demoOtp}`
          : res.data.message
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to send OTP';
      setError(msg);
      setOtpSent(false);
    }
  };

  const verifyOtp = async () => {
    setError('');

    try {
      const res = await axios.post('/api/auth/verify-otp', {
        email: form.email,
        otp: form.otp,
      });
      setOtpMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await axios.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp: form.otp,
      });
      setLoginUsername(form.username);
      setLoginPassword('');
      setMode('login');
      navigate('/login', { replace: true });
      setOtpSent(false);
      setOtpMessage('');
      setSuccessMessage('Registration successful. Please log in to continue.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const res = await axios.post('/api/auth/login', {
        username: loginUsername,
        password: loginPassword,
      });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-xl font-bold text-white shadow-md">
            W
          </div>
          <h2 className="text-3xl font-bold text-slate-800">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'login' ? 'Sign in to continue to WELD CRM' : 'Register and verify before you proceed'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => updateForm('username', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email ID</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                  placeholder="Email ID"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">OTP</label>
                <input
                  type="text"
                  value={form.otp}
                  onChange={(e) => updateForm('otp', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                  placeholder="Enter OTP"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={sendOtp}
                  className="w-full rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-300"
                >
                  Send OTP
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateForm('confirmPassword', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>


            {otpSent && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {otpMessage}
              </div>
            )}

            <button
              type="button"
              onClick={verifyOtp}
              className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
            >
              Verify OTP
            </button>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700">
              Register
            </button>
          </form>
        )}

        <div className="mt-5 text-center text-sm text-slate-500">
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              const nextMode = mode === 'login' ? 'register' : 'login';
              setMode(nextMode);
              navigate(`/${nextMode}`);
              setError('');
              setSuccessMessage('');
              setOtpSent(false);
              setOtpMessage('');
            }}
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            {mode === 'login' ? 'Register here' : 'Login here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;