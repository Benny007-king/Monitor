import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return <Dashboard setToken={setToken} token={token} />;
}
