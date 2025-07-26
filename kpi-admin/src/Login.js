import React, { useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('Login berjaya:', data.user);
        navigate('/');
      }
    } catch (error) {
      setError('Ralat sistem. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        setError('Sila check email anda untuk pengesahan.');
      }
    } catch (error) {
      setError('Ralat sistem. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
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
                Kata Laluan:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                placeholder="Masukkan kata laluan"
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