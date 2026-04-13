import { useState, useEffect } from 'react';
import { LogOut, Settings, Plus, Edit2, Trash2, Activity, Globe, Shield, ActivitySquare, Search, Building } from 'lucide-react';
import SettingsModal from './SettingsModal';
import UrlModal from './UrlModal';

export interface UrlItem {
  id: number;
  url: string;
  company: string;
  check_443: boolean;
  check_80: boolean;
  check_ping: boolean;
  status_443: string;
  status_80: string;
  status_ping: string;
  last_checked: string;
}

export default function Dashboard({ setToken, token }: { setToken: (token: string | null) => void, token: string }) {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<UrlItem | null>(null);

  // New states for Filtering and Search
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchUrls = async () => {
    try {
      const res = await fetch('/api/urls', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUrls(data);
      } else if (res.status === 401 || res.status === 403) {
        setToken(null);
      }
    } catch (err) {
      console.error('Failed to fetch URLs', err);
    }
  };

  useEffect(() => {
    fetchUrls();
    const interval = setInterval(fetchUrls, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this monitor?')) return;
    try {
      await fetch(`/api/urls/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUrls();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const StatusBadge = ({ status, enabled }: { status: string, enabled: boolean }) => {
    if (!enabled) return <span className="text-gray-600 text-xs font-medium px-2 py-1 rounded bg-gray-800/50">N/A</span>;
    if (status === 'UP') return <span className="text-green-400 text-xs font-medium px-2 py-1 rounded bg-green-400/10 border border-green-400/20">UP</span>;
    if (status === 'DOWN') return <span className="text-red-400 text-xs font-medium px-2 py-1 rounded bg-red-400/10 border border-red-400/20 animate-pulse">DOWN</span>;
    return <span className="text-yellow-400 text-xs font-medium px-2 py-1 rounded bg-yellow-400/10 border border-yellow-400/20">PENDING</span>;
  };

  // --- Derived Data for UI ---
  
  // 1. Get unique organizations for the sidebar
  const organizations = Array.from(new Set(urls.map(u => u.company))).sort();

  // 2. Filter URLs based on Selected Organization AND Search Query
  const filteredUrls = urls.filter(item => {
    const matchesOrg = selectedOrg ? item.company === selectedOrg : true;
    const matchesSearch = searchQuery 
      ? item.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.company.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesOrg && matchesSearch;
  });

  // 3. Autocomplete suggestions (only when searching)
  const searchSuggestions = searchQuery 
    ? urls.filter(item => 
        item.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-netscaler-darker text-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-netscaler-dark border-b border-netscaler-gray sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <img src="/netscaler_logo.png" alt="NetScaler" className="h-8 object-contain mr-4" onError={(e) => {
                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Citrix_NetScaler_Logo.svg/512px-Citrix_NetScaler_Logo.svg.png';
              }} />
              <h1 className="text-xl font-semibold hidden lg:block">Gateway Monitor</h1>
            </div>

            {/* Search Bar with Autocomplete */}
            <div className="flex-1 max-w-xl px-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by URL or Organization..." 
                  className="w-full bg-netscaler-darker border border-netscaler-gray rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-netscaler-blue focus:ring-1 focus:ring-netscaler-blue transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay allows clicking a suggestion before hiding
                />
              </div>
              
              {/* Autocomplete Dropdown */}
              {isSearchFocused && searchQuery && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-4 right-4 mt-1 bg-netscaler-dark border border-netscaler-gray rounded-md shadow-xl z-50 max-h-60 overflow-y-auto">
                  {searchSuggestions.map(item => (
                    <div 
                      key={item.id} 
                      className="px-4 py-3 hover:bg-netscaler-gray/50 cursor-pointer border-b border-netscaler-gray/30 last:border-0 flex flex-col"
                      onClick={() => {
                        setSearchQuery(item.url); // Fill search with the exact URL
                        setSelectedOrg(item.company); // Auto-filter by this org
                      }}
                    >
                      <span className="font-medium text-white text-sm">{item.url}</span>
                      <span className="text-xs text-netscaler-blue mt-0.5 flex items-center">
                        <Building className="h-3 w-3 mr-1" /> {item.company}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => { setEditingUrl(null); setIsUrlModalOpen(true); }}
                className="hidden sm:flex items-center px-4 py-2 bg-netscaler-blue text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium mr-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add URL
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-netscaler-gray rounded-full transition-colors"
                title="Settings & Notifications"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setToken(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-netscaler-gray rounded-full transition-colors"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar - Organizations */}
        <aside className="w-64 bg-netscaler-dark border-r border-netscaler-gray overflow-y-auto hidden md:block shrink-0">
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Organizations
            </h3>
            <ul className="space-y-1.5">
              <li>
                <button 
                  onClick={() => setSelectedOrg(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors font-medium ${!selectedOrg ? 'bg-netscaler-blue/20 text-netscaler-blue border border-netscaler-blue/30' : 'text-gray-300 hover:bg-netscaler-gray/50 border border-transparent'}`}
                >
                  All Organizations
                  <span className="float-right text-xs bg-netscaler-darker px-2 py-0.5 rounded-full text-gray-400">
                    {urls.length}
                  </span>
                </button>
              </li>
              {organizations.map(org => {
                const count = urls.filter(u => u.company === org).length;
                return (
                  <li key={org}>
                    <button 
                      onClick={() => setSelectedOrg(org)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedOrg === org ? 'bg-netscaler-blue/20 text-netscaler-blue border border-netscaler-blue/30 font-medium' : 'text-gray-400 hover:bg-netscaler-gray/50 hover:text-gray-200 border border-transparent'}`}
                    >
                      <span className="truncate block w-4/5 float-left" title={org}>{org}</span>
                      <span className="float-right text-xs bg-netscaler-darker px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Dashboard Grid area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {selectedOrg ? `Monitored Services: ${selectedOrg}` : 'All Monitored Services'}
            </h2>
            <button
              onClick={() => { setEditingUrl(null); setIsUrlModalOpen(true); }}
              className="sm:hidden flex items-center px-3 py-2 bg-netscaler-blue text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredUrls.map((item) => (
              <div key={item.id} className="bg-netscaler-dark rounded-lg border border-netscaler-gray p-5 shadow-lg flex flex-col hover:border-netscaler-gray/80 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-4/5">
                    <h3 className="text-lg font-semibold text-white truncate flex items-center" title={item.company}>
                      <Building className="h-4 w-4 mr-2 text-netscaler-blue" />
                      {item.company}
                    </h3>
                    <p className="text-sm text-gray-400 truncate mt-1" title={item.url}>{item.url}</p>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <button onClick={() => { setEditingUrl(item); setIsUrlModalOpen(true); }} className="text-gray-400 hover:text-blue-400 transition-colors bg-netscaler-darker p-1.5 rounded">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-400 transition-colors bg-netscaler-darker p-1.5 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  <div className="flex justify-between items-center bg-netscaler-darker p-2.5 rounded border border-netscaler-gray/50">
                    <div className="flex items-center text-sm font-medium">
                      <Shield className="h-4 w-4 mr-2 text-gray-400" />
                      HTTPS (443)
                    </div>
                    <StatusBadge status={item.status_443} enabled={item.check_443} />
                  </div>
                  <div className="flex justify-between items-center bg-netscaler-darker p-2.5 rounded border border-netscaler-gray/50">
                    <div className="flex items-center text-sm font-medium">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      HTTP (80)
                    </div>
                    <StatusBadge status={item.status_80} enabled={item.check_80} />
                  </div>
                  <div className="flex justify-between items-center bg-netscaler-darker p-2.5 rounded border border-netscaler-gray/50">
                    <div className="flex items-center text-sm font-medium">
                      <ActivitySquare className="h-4 w-4 mr-2 text-gray-400" />
                      ICMP Ping
                    </div>
                    <StatusBadge status={item.status_ping} enabled={item.check_ping} />
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 text-right">
                  {/* Added 'Z' to fix the UTC+3 timezone issue discussed previously */}
                  Last checked: {item.last_checked ? new Date(item.last_checked + 'Z').toLocaleTimeString() : 'Never'}
                </div>
              </div>
            ))}
            
            {/* Empty State */}
            {filteredUrls.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500 bg-netscaler-dark rounded-lg border border-dashed border-netscaler-gray">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg mb-1">
                  {urls.length === 0 ? 'No services monitored yet.' : 'No matching services found.'}
                </p>
                {urls.length === 0 && (
                  <button 
                    onClick={() => { setEditingUrl(null); setIsUrlModalOpen(true); }}
                    className="mt-2 text-netscaler-blue hover:underline"
                  >
                    Add your first URL
                  </button>
                )}
                {urls.length > 0 && searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedOrg(null); }}
                    className="mt-2 text-netscaler-blue hover:underline"
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {isSettingsOpen && <SettingsModal token={token} onClose={() => setIsSettingsOpen(false)} />}
      {isUrlModalOpen && <UrlModal token={token} urlItem={editingUrl} onClose={() => setIsUrlModalOpen(false)} onSave={fetchUrls} />}
    </div>
  );
}