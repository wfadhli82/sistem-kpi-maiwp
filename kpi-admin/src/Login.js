import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Helper: get users from localStorage
  const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
  // Helper: save users to localStorage
  const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

  // Helper: set current user session
  const setCurrentUser = (user) => localStorage.setItem('currentUser', JSON.stringify(user));

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const users = getUsers();
      console.log('All users in localStorage:', users);
      console.log('Attempting login with:', { email, password });
      
      // Find user by email
      const user = users.find(u => u.email === email);
      console.log('Found user:', user);
      
      if (!user) {
        setError('Emel tidak dijumpai.');
        setLoading(false);
        return;
      }
      
      // Check password if user has password field
      if (user.password) {
        if (user.password !== password) {
          setError('Kata laluan tidak sah.');
          setLoading(false);
          return;
        }
      } else {
        // User exists but no password - allow login without password
        console.log('User has no password - allowing login without password');
      }
      
      setCurrentUser(user);
      setLoading(false);
      navigate('/');
    }, 500);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      let users = getUsers();
      if (users.some(u => u.email === email)) {
        setError('Emel sudah didaftarkan.');
        setLoading(false);
        return;
      }
      // Default role: user, unless admin/admin_bahagian ditambah dari Pengurusan Pengguna
      const newUser = {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email,
        password,
        role: 'user',
        department: null
      };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      setLoading(false);
      navigate('/');
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Image Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/menara-maiwp.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        zIndex: 1
      }} />
      
      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '60px 20px 40px 20px'
      }}>
        <img 
          src="/logo-maiwp.png" 
          alt="MAIWP Logo" 
          style={{ 
            height: '80px', 
            marginBottom: '24px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }} 
        />
        <h1 style={{ 
          color: '#fff', 
          fontWeight: 800, 
          fontSize: '2.5rem',
          margin: '0 0 16px 0',
          textShadow: '0 4px 8px rgba(0,0,0,0.5)',
          letterSpacing: '1px'
        }}>
          Sistem Pemantauan Prestasi MAIWP
        </h1>
        <div style={{
          width: '80px',
          height: '4px',
          background: 'linear-gradient(90deg, #e53935 0%, #ff6b6b 100%)',
          margin: '0 auto 24px auto',
          borderRadius: '2px'
        }} />
        <p style={{ 
          color: '#b0b0b0', 
          fontSize: '1.1rem',
          margin: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Sistem ini dibangunkan bagi meningkatkan kecekapan dalam pemantauan prestasi MAIWP secara keseluruhannya
        </p>
      </div>

      {/* Login Form */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 20px 60px 20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '420px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ 
              color: '#1976d2', 
              fontWeight: 700, 
              margin: '0 0 8px 0',
              fontSize: '1.8rem'
            }}>
              Log Masuk
            </h2>
            <p style={{ 
              color: '#666', 
              margin: 0,
              fontSize: '0.95rem'
            }}>
              Masukkan maklumat akaun anda
            </p>
          </div>

          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1.5px solid #ddd',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Masukkan email anda"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                Kata Laluan: <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 'normal' }}>(Opsional untuk user tanpa password)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1.5px solid #ddd',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Masukkan kata laluan (atau kosongkan jika tiada password)"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Memproses...' : 'Log Masuk'}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ffa000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                Daftar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  }
  
  export default Login; 