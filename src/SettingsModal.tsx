import React, { useState, useEffect } from 'react';
import { X, Save, Bell, Lock } from 'lucide-react';

export default function SettingsModal({ token, onClose }: { token: string, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'admin' | 'notifications'>('admin');
  
  // Admin state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminMsg, setAdminMsg] = useState('');

  // Email state
  const [emailConfig, setEmailConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    to: 'bennyd@integrity-software.co.il'
  });
  const [emailMsg, setEmailMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings/email', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data) setEmailConfig(data);
    });
  }, [token]);

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setAdminMsg('Passwords do not match');
      return;
    }
    if (newPassword.length < 5) {
      setAdminMsg('Password too short');
      return;
    }

    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) {
        setAdminMsg('Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setAdminMsg('Failed to update password');
      }
    } catch (err) {
      setAdminMsg('Network error');
    }
  };

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailConfig)
      });
      if (res.ok) {
        setEmailMsg('Email settings saved');
        
        // Request desktop notification permission
        if ('Notification' in window) {
          Notification.requestPermission();
        }
      } else {
        setEmailMsg('Failed to save settings');
      }
    } catch (err) {
      setEmailMsg('Network error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-netscaler-dark w-full max-w-2xl rounded-lg shadow-2xl border border-netscaler-gray flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-netscaler-gray">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex border-b border-netscaler-gray">
          <button 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${activeTab === 'admin' ? 'text-netscaler-blue border-b-2 border-netscaler-blue bg-netscaler-gray/20' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('admin')}
          >
            <Lock className="h-4 w-4 mr-2" />
            Admin Account
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${activeTab === 'notifications' ? 'text-netscaler-blue border-b-2 border-netscaler-blue bg-netscaler-gray/20' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSave} className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Change Admin Password</h3>
              {adminMsg && <div className="text-sm text-netscaler-blue mb-4">{adminMsg}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
                  required
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="flex items-center px-4 py-2 bg-netscaler-blue text-white rounded hover:bg-blue-600 transition-colors">
                  <Save className="h-4 w-4 mr-2" />
                  Save Password
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleEmailSave} className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-2">Email Notifications (SMTP)</h3>
              <p className="text-sm text-gray-400 mb-4">Configure SMTP server to receive downtime alerts.</p>
              {emailMsg && <div className="text-sm text-netscaler-blue mb-4">{emailMsg}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SMTP Host</label>
                  <input 
                    type="text" 
                    value={emailConfig.host}
                    onChange={e => setEmailConfig({...emailConfig, host: e.target.value})}
                    className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SMTP Port</label>
                  <input 
                    type="number" 
                    value={emailConfig.port}
                    onChange={e => setEmailConfig({...emailConfig, port: parseInt(e.target.value)})}
                    className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SMTP User</label>
                  <input 
                    type="text" 
                    value={emailConfig.user}
                    onChange={e => setEmailConfig({...emailConfig, user: e.target.value})}
                    className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SMTP Password</label>
                  <input 
                    type="password" 
                    value={emailConfig.pass}
                    onChange={e => setEmailConfig({...emailConfig, pass: e.target.value})}
                    className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Email</label>
                  <input 
                    type="email" 
                    value={emailConfig.to}
                    onChange={e => setEmailConfig({...emailConfig, to: e.target.value})}
                    className="w-full bg-netscaler-darker border border-netscaler-gray rounded p-2 text-white focus:border-netscaler-blue focus:outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex items-center mt-2">
                  <input 
                    type="checkbox" 
                    id="secure"
                    checked={emailConfig.secure}
                    onChange={e => setEmailConfig({...emailConfig, secure: e.target.checked})}
                    className="h-4 w-4 text-netscaler-blue focus:ring-netscaler-blue border-gray-300 rounded bg-netscaler-darker"
                  />
                  <label htmlFor="secure" className="ml-2 block text-sm text-gray-300">
                    Use TLS/SSL (Secure)
                  </label>
                </div>
              </div>
              
              <div className="pt-4 border-t border-netscaler-gray mt-6">
                <h3 className="text-lg font-medium text-white mb-2">Desktop Notifications</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Saving these settings will also prompt your browser to allow desktop push notifications for downtime alerts.
                </p>
                <button type="submit" className="flex items-center px-4 py-2 bg-netscaler-blue text-white rounded hover:bg-blue-600 transition-colors">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
