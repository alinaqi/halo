import React, { useState } from 'react';
import { useAI } from '../../contexts/AIContext';
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export const APISettings: React.FC = () => {
  const { authState, connectionStatus, initialize, disconnect } = useAI();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');

  const handleQuickStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await initialize(); // Uses managed/environment key
    } catch (err: any) {
      setError('Failed to connect. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await initialize(apiKey);
      setApiKey(''); // Clear the key from the form after successful connection
    } catch (err: any) {
      setError(err.message || 'Failed to connect with the provided API key');
    } finally {
      setIsLoading(false);
    }
  };

  if (authState.isAuthenticated) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">API Configuration</h2>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-600">Connected</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Provider:</span>
            <span className="font-medium">Anthropic</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Model:</span>
            <span className="font-medium">Claude 3 Opus</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Source:</span>
            <span className="font-medium capitalize">{authState.apiKeySource}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tier:</span>
            <span className="font-medium capitalize">{authState.tier}</span>
          </div>
        </div>

        <button
          onClick={disconnect}
          className="mt-6 w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Connect to AI</h2>

      {mode === 'quick' ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Quick Start (Recommended)</h3>
            <p className="text-sm text-blue-700 mb-3">
              Get started immediately with no setup required. Perfect for trying out Halo.
            </p>
            <ul className="text-sm text-blue-600 space-y-1 mb-4">
              <li>✓ No API key needed</li>
              <li>✓ 100 free operations per month</li>
              <li>✓ Upgrade anytime</li>
            </ul>
            <button
              onClick={handleQuickStart}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Start with Quick Setup'
              )}
            </button>
          </div>

          <button
            onClick={() => setMode('custom')}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            Use my own API key →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Use Your API Key</h3>
            <p className="text-sm text-gray-600 mb-3">
              Connect with your own Anthropic API key for unlimited usage.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api..."
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setMode('quick')}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleConnect}
              disabled={isLoading || !apiKey.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Connect'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your API key is encrypted and stored locally on your device.
          </p>
        </div>
      )}
    </div>
  );
};