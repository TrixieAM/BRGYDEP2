import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import bldg from '../assets/bldg.jpg';
import CaloocanLogo from '../assets/CaloocanLogo.png';
import Logo145 from '../assets/Logo145.png';
import CmBldg from '../assets/CmBldg.png';

const IconUser = ({ color = '#0D4715' }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
    <path
      d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconLock = ({ color = '#0D4715' }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="5"
      y="10"
      width="14"
      height="10"
      rx="2"
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M8 10V8a4 4 0 1 1 8 0v2"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="14.5" r="1.4" fill={color} />
  </svg>
);

const IconArrowRight = ({ color = '#FFFFFF' }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12h14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 6l6 6-6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSpinner = ({ color = '#FFFFFF' }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke={color}
      strokeWidth="2"
      opacity="0.25"
    />
    <path
      d="M20 12a8 8 0 0 0-8-8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-clear transient errors after display
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic client-side validation to avoid native browser popups
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Username and password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccess(`Welcome back, ${data.user.name}! (${data.user.role})`);

      // Persist token for authenticated API calls
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Use the auth context to handle login
      login(data.user);

      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        backgroundImage: `url(${bldg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(135, 120, 107, 0.7)',
          zIndex: 1,
        }}
      ></div>
      <div
        style={{
          backgroundColor: 'white',
          backdropFilter: 'blur(10px)',
          border: 'none',
          borderRadius: '14px',
          boxShadow:
            '0 12px 32px rgba(0,0,0,0.16), 0 0 0 2px #0D471520, 0 0 18px 4px #41644A14',
          padding: '3rem',
          marginLeft: '50rem',
          height: '100vh',
          maxHeight: '640px',
          width: '100%',
          maxWidth: '460px',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
          paddingBottom: '7rem', // extra space for background image near button
        }}
      >
        <div
          style={{
            background: '#0D4715',
            color: '#F1F0E9',
            borderRadius: '10px',
            padding: '1.25rem 1rem 1rem',
            textAlign: 'center',
            margin: '-1.5rem -1.5rem 2rem',
            position: 'relative',
            boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #F1F0E9',
              backgroundColor: '#F1F0E9',
            }}
          >
            <img
              src={CaloocanLogo}
              alt="Caloocan Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '65px',
              height: '65px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #F1F0E9',
              backgroundColor: '#F1F0E9',
            }}
          >
            <img
              src={Logo145}
              alt="Logo 145"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          <h1
            style={{
              margin: '0 0 0.35rem 0',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
            }}
          >
            LOGIN
          </h1>
          <p
            style={{
              margin: 0,
              color: '#F1F0E9',
              fontSize: '1rem',
              opacity: 0.9,
              marginBottom: '1rem',
            }}
          >
            Login your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconUser />
            </span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #f3dbaaff',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                outline: 'none',
                backgroundColor: 'white',
                color: '#445C3C',
                paddingLeft: '2.5rem',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#0D4715')}
              onBlur={(e) => (e.target.style.borderColor = '#445C3C')}
              placeholder="Username"
            />
          </div>

          <div style={{ marginBottom: '3%', position: 'relative' }}>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconLock />
            </span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #f3dbaaff',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                outline: 'none',
                backgroundColor: 'white',
                color: '#445C3C',
                paddingLeft: '2.5rem',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#0D4715')}
              onBlur={(e) => (e.target.style.borderColor = '#445C3C')}
              placeholder="Password"
            />
          </div>

          <div
            style={{
              marginBottom: '2rem',
              textAlign: 'left',
            }}
          >
            <button
              type="button"
              onClick={() =>
                alert('Please contact the administrator for password recovery')
              }
              style={{
                background: 'none',
                border: 'none',
                color: '#0D4715',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => (e.target.style.opacity = '0.7')}
              onMouseOut={(e) => (e.target.style.opacity = '1')}
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(255, 238, 238, 0.9)',
                color: '#c33',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                border: '1px solid #fcc',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: 'rgba(238, 255, 238, 0.9)',
                color: '#0D4715',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                border: '1px solid #0D4715',
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#ccc' : '#0D4715',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#0a3a10';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#0D4715';
              }
            }}
          >
            <span
              aria-hidden="true"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {loading ? <IconSpinner /> : <IconArrowRight />}
            </span>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '78%',
            maxWidth: '340px',
            minWidth: '230px',
            opacity: 0.97,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <img
            src={CmBldg}
            alt="Community building"
            style={{
              width: '455px',
              height: '270px',
              marginBottom: '-49px',
              marginLeft: '-55px',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.18))',
            }}
          />
        </div>

        {/* <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 218, 185, 0.7)'
        }}>
          <p style={{
            margin: '0 0 0.5rem 0',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Don't have an account?
          </p>
          <button
            onClick={() => {
              alert('Contact administrator to create an account');
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#0D4715',
              border: '2px solid #0D4715',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0D4715';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#0D4715';
            }}
          >
            Request Account
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
