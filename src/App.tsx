import React, { useState } from 'react';
import { APISettings } from './components/Settings/APISettings';
import { FileExplorer } from './components/FileExplorer/FileExplorer';
import { AIProvider } from './contexts/AIContext';

function App() {
  const [isSetup, setIsSetup] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'files'>('chat');

  return (
    <AIProvider>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #1e293b, #334155)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '500px', width: '100%' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖 Welcome to Halo</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.9 }}>
            Your AI Desktop Assistant
          </p>

          {!isSetup ? (
            <>
              <APISettings />
              <button
                onClick={() => setIsSetup(true)}
                style={{
                  marginTop: '1rem',
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '400px'
                }}
              >
                Continue to Chat →
              </button>
            </>
          ) : (
            <div style={{
              background: 'white',
              color: 'black',
              borderRadius: '1rem',
              height: '600px',
              width: '100%',
              maxWidth: '1200px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc'
              }}>
                <button
                  onClick={() => setCurrentView('chat')}
                  style={{
                    padding: '1rem 2rem',
                    background: currentView === 'chat' ? 'white' : 'transparent',
                    border: 'none',
                    borderBottom: currentView === 'chat' ? '2px solid #3b82f6' : 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: currentView === 'chat' ? '600' : '400'
                  }}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setCurrentView('files')}
                  style={{
                    padding: '1rem 2rem',
                    background: currentView === 'files' ? 'white' : 'transparent',
                    border: 'none',
                    borderBottom: currentView === 'files' ? '2px solid #3b82f6' : 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: currentView === 'files' ? '600' : '400'
                  }}
                >
                  📁 Files
                </button>
              </div>

              {/* Content Area */}
              <div style={{ height: 'calc(100% - 49px)' }}>
                {currentView === 'chat' ? (
                  <div style={{
                    padding: '2rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <h2 style={{ marginBottom: '1rem' }}>Chat Interface</h2>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                      Phase 1.3 - Chat interface will be implemented here
                    </p>
                    <div style={{
                      flex: 1,
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1rem',
                      background: '#f8fafc',
                      overflowY: 'auto'
                    }}>
                      <p style={{ color: '#94a3b8' }}>Chat messages will appear here...</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Type your message..."
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                      <button style={{
                        padding: '0.75rem 1.5rem',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}>
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <FileExplorer />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AIProvider>
  );
}

export default App;