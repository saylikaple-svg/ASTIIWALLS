import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Check, RefreshCw } from 'lucide-react';
import { getActiveFirebaseConfig, updateFirebaseConfig } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const FirebaseConfigModal = ({ isOpen, onClose, playClickSound }) => {
  if (!isOpen) return null;

  const { showToast } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [rawJson, setRawJson] = useState('');

  useEffect(() => {
    const cfg = getActiveFirebaseConfig();
    if (cfg && !cfg.apiKey?.includes('DummyKey')) {
      setApiKey(cfg.apiKey || '');
      setAuthDomain(cfg.authDomain || '');
      setProjectId(cfg.projectId || '');
      setStorageBucket(cfg.storageBucket || '');
      setMessagingSenderId(cfg.messagingSenderId || '');
      setAppId(cfg.appId || '');
    }
  }, [isOpen]);

  const handleJsonPaste = (text) => {
    setRawJson(text);
    try {
      // Clean possible js object format to json
      const cleaned = text
        .replace(/const\s+firebaseConfig\s*=\s*/, '')
        .replace(/;?\s*$/, '')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/'/g, '"');

      const parsed = JSON.parse(cleaned);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      showToast('Firebase configuration parsed from JSON! 🚀');
    } catch {
      // Not pure json, ignore
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (playClickSound) playClickSound();

    if (!apiKey.trim() || !projectId.trim()) {
      showToast('Please enter at least an API Key and Project ID', 'error');
      return;
    }

    const newConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    updateFirebaseConfig(newConfig);
    showToast('Firebase Console credentials connected! 🔥');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border-4 border-black rounded-3xl shadow-brutal-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-yestalgia-dark text-white px-6 py-4 flex items-center justify-between border-b-3 border-black">
          <div className="flex items-center gap-3">
            <span className="bg-yestalgia-lime text-black font-mono font-black text-xs px-2.5 py-0.5 rounded">
              REAL AUTH SETUP
            </span>
            <h2 className="font-heading font-black text-lg uppercase tracking-wide text-yestalgia-lime">
              Firebase Console Setup
            </h2>
          </div>

          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              onClose();
            }}
            className="p-1.5 bg-yestalgia-pink hover:bg-white text-black font-bold rounded-xl border-2 border-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Guide Steps */}
          <div className="p-4 bg-yestalgia-bg border-2 border-black rounded-2xl space-y-2 text-xs font-body">
            <p className="font-heading font-black text-sm uppercase text-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-700" />
              How to connect your Firebase Project:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-800 font-medium leading-relaxed">
              <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> and create or open your project.</li>
              <li>Under <strong>Authentication &gt; Sign-in method</strong>, enable <strong>Google</strong>.</li>
              <li>Under <strong>Authentication &gt; Settings &gt; Authorized domains</strong>, make sure <code>localhost</code> is added.</li>
              <li>Go to <strong>Project Settings &gt; General &gt; Your apps &gt; Web (<code>&lt;/&gt;</code>)</strong> and paste the config below (or in the <code>.env</code> file).</li>
            </ol>
          </div>

          {/* Quick Paste Box */}
          <div>
            <label className="block font-mono text-xs font-bold text-black uppercase tracking-wider mb-1.5">
              Paste Firebase Config snippet (Auto-fill)
            </label>
            <textarea
              rows={2}
              value={rawJson}
              onChange={(e) => handleJsonPaste(e.target.value)}
              placeholder="Paste const firebaseConfig = { apiKey: '...', ... } here"
              className="w-full px-3 py-2 bg-gray-50 border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-yestalgia-lime"
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs font-bold text-black uppercase mb-1">
                API Key *
              </label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-xl font-mono text-xs shadow-brutal-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-black uppercase mb-1">
                Project ID *
              </label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="my-wallpaper-app"
                className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-xl font-mono text-xs shadow-brutal-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-black uppercase mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="my-wallpaper-app.firebaseapp.com"
                className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-xl font-mono text-xs shadow-brutal-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-black uppercase mb-1">
                App ID
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:123456789:web:abcdef"
                className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-xl font-mono text-xs shadow-brutal-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-brutal bg-white px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-brutal-lime px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-brutal cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Connect Firebase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
