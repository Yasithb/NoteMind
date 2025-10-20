import React, { useState, useEffect } from 'react';
import './ApiSettings.css';

/**
 * Component for managing API settings
 */
const ApiSettings = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [testResult, setTestResult] = useState('');
  
  // Load current API key on component mount
  useEffect(() => {
    const getApiKey = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/settings');
        const data = await response.json();
        
        if (response.ok) {
          // Mask API key for display
          if (data.apiKey) {
            const maskedKey = `${data.apiKey.substring(0, 5)}...${data.apiKey.substring(data.apiKey.length - 4)}`;
            setApiKey(maskedKey);
          }
        } else {
          setMessage('Failed to load API settings');
        }
      } catch (error) {
        console.error('Error fetching API settings:', error);
        setMessage('Network error when loading settings');
      }
    };
    
    getApiKey();
  }, []);
  
  // Save the API key
  const saveApiKey = async () => {
    if (!apiKey || apiKey.includes('...')) {
      setMessage('Please enter a valid API key');
      return;
    }
    
    setStatus('loading');
    setMessage('Saving API key...');
    
    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
      
      if (response.ok) {
        setStatus('success');
        setMessage('API key saved successfully');
        
        // Mask the key after saving
        const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`;
        setApiKey(maskedKey);
      } else {
        const errorData = await response.json();
        setStatus('error');
        setMessage(`Error saving API key: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Network error: ${error.message}`);
    }
  };
  
  // Test the API connection
  const testApiConnection = async () => {
    setStatus('loading');
    setMessage('Testing API connection...');
    setTestResult('');
    
    try {
      const response = await fetch('http://localhost:5000/api/test-connection');
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('API connection successful');
        setTestResult(data.message || 'The API connection works!');
      } else {
        setStatus('error');
        setMessage('API connection failed');
        setTestResult(data.error || 'Unknown error');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error during API test');
      setTestResult(error.message);
    }
  };
  
  return (
    <div className="api-settings-modal">
      <div className="api-settings-content">
        <div className="api-settings-header">
          <h2>API Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="api-settings-body">
          <div className="form-group">
            <label htmlFor="apiKey">OpenAI API Key:</label>
            <input 
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="api-key-input"
            />
            <p className="api-key-info">
              Your API key is stored securely on the server and never shared with third parties.
            </p>
          </div>
          
          {message && (
            <div className={`message ${status === 'error' ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
          
          {testResult && (
            <div className="test-result">
              <h3>Test Result:</h3>
              <pre>{testResult}</pre>
            </div>
          )}
          
          <div className="api-settings-actions">
            <button 
              className="secondary-button"
              onClick={testApiConnection}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button 
              className="primary-button"
              onClick={saveApiKey}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Saving...' : 'Save API Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;