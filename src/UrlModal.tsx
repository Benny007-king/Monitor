import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { UrlItem } from './Dashboard';

export default function UrlModal({ 
  token, 
  urlItem, 
  onClose, 
  onSave 
}: { 
  token: string, 
  urlItem: UrlItem | null, 
  onClose: () => void, 
  onSave: () => void 
}) {
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [check443, setCheck443] = useState(true);
  const [check80, setCheck80] = useState(false);
  const [checkPing, setCheckPing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (urlItem) {
      setUrl(urlItem.url);
      setCompany(urlItem.company);
      setCheck443(urlItem.check_443);
      setCheck80(urlItem.check_80);
      setCheckPing(urlItem.check_ping);
    }
  }, [urlItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    let cleanUrl = url.trim();
    if (cleanUrl.startsWith('http://')) cleanUrl = cleanUrl.replace('http://', '');
    if (cleanUrl.startsWith('https://')) cleanUrl = cleanUrl.replace('https://', '');

    if (!cleanUrl) {
      setError('URL is required');
      return;
    }

    const payload = {
      url: cleanUrl,
      company,
      check_443: check443,
      check_80: check80,
      check_ping: checkPing
    };

    try {
      const endpoint = urlItem ? `/api/urls/${urlItem.id}` : '/api/urls';
      const method = urlItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        setError('Failed to save URL');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-netscaler-dark w-full max-w-md rounded-lg shadow-2xl border border-netscaler-gray flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-netscaler-gray">
          <h2 className="text-xl font-semibold text-white">{urlItem ? 'Edit Service' : 'Add Service'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-400/10 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company / Title</label>
            <input 
              type="text" 
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
              placeholder="e.g. Acme Corp"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Hostname / IP</label>
            <input 
              type="text" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
              placeholder="e.g. gateway.acme.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Do not include http:// or https://</p>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Checks to Perform</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={check443}
                  onChange={e => setCheck443(e.target.checked)}
                  className="h-4 w-4 text-netscaler-blue focus:ring-netscaler-blue border-gray-300 rounded bg-netscaler-darker"
                />
                <span className="ml-2 text-sm text-gray-300">HTTPS (Port 443)</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={check80}
                  onChange={e => setCheck80(e.target.checked)}
                  className="h-4 w-4 text-netscaler-blue focus:ring-netscaler-blue border-gray-300 rounded bg-netscaler-darker"
                />
                <span className="ml-2 text-sm text-gray-300">HTTP (Port 80)</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={checkPing}
                  onChange={e => setCheckPing(e.target.checked)}
                  className="h-4 w-4 text-netscaler-blue focus:ring-netscaler-blue border-gray-300 rounded bg-netscaler-darker"
                />
                <span className="ml-2 text-sm text-gray-300">ICMP Ping</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-netscaler-gray text-gray-300 rounded hover:bg-netscaler-gray/50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex items-center px-4 py-2 bg-netscaler-blue text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
