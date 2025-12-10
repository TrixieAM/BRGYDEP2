import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, #0D4715 0%, #1a5f2e 40%, #0D2818 100%)',
      color: 'white',
      padding: '2rem 2rem 1rem 2rem',
      marginTop: 'auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              Barangay 145
            </h3>
            <p style={{
              margin: '0 0 1rem 0',
              lineHeight: '1.6',
              opacity: 0.9
            }}>
              Serving our community with dedication and integrity. 
              Your trusted partner in local governance and public service.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <div style={{
                width: '35px',
                height: '35px',
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#0D4715'
              }}>
                B
              </div>
            </div>
          </div>
          
          <div>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              Quick Links
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/" style={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  transition: 'opacity 0.3s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '1'}
                onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Home
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/residents" style={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  transition: 'opacity 0.3s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '1'}
                onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Residents
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/certificates" style={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  transition: 'opacity 0.3s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '1'}
                onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Certificates
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/login" style={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  transition: 'opacity 0.3s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '1'}
                onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Login
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              Contact Information
            </h4>
            <div style={{
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                📍 Barangay 145 Office
              </p>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                📞 (02) 123-4567
              </p>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                ✉️ barangay145@email.com
              </p>
              <p style={{ margin: '0' }}>
                🕒 Mon-Fri: 8:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>
        
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '1rem',
          textAlign: 'center',
          opacity: 0.8
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.9rem'
          }}>
            © 2024 Barangay 145 Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
