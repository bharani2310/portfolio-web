import { useState } from 'react';
import { authService } from '../../services/adminService';
import { Field, Button, Card, StatusBanner } from './components/ui.jsx';
import { FiCopy } from "react-icons/fi";

export default function AdminPassword() {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [tokenType, setTokenType] = useState('user');
  const [credentials, setCredentials] = useState({ email:'', password:'' });
  const [token, setToken] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const clearStatus = () => setTimeout(() => { setStatus(null); setMessage(''); }, 4000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setStatus('error'); setMessage('New password and confirmation do not match.'); return clearStatus();
    }
    setSaving(true);
    try {
      await authService.changePassword(form.currentPassword, form.newPassword);
      setStatus('success');
      setMessage('Password updated successfully.');
      setForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
      clearStatus();
    }
  };

  const generateToken = async () => {
    try {
      setLoadingToken(true);
      let generatedToken = '';
      if (tokenType === 'user') {
        generatedToken = import.meta.env.VITE_MIDDLEWARE_API_TOKEN || '';
      } else {
        const data = await authService.generateAdminToken(credentials.email, credentials.password);
        generatedToken = data.token || data.accessToken || '';
      }
      setToken(generatedToken);
      setStatus('success');
      setMessage(`${tokenType === 'user' ? 'User' : 'Admin'} token generated successfully.`);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || 'Failed to generate token.');
    } finally {
      setLoadingToken(false);
      clearStatus();
    }
  };

  const copyToken = async () => {
    await navigator.clipboard.writeText(token);
    setStatus('success');
    setMessage('Token copied successfully.');
    clearStatus();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display font-bold text-2xl mb-1">Password</h2>
        <p className="text-ink/50 text-sm">
          Forgot your current password instead? Run <code className="font-mono text-accent-mint">npm run admin:reset-password</code> from the backend.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current Password" type="password" value={form.currentPassword} onChange={e=>setForm(f=>({...f,currentPassword:e.target.value}))} required />
          <Field label="New Password" type="password" value={form.newPassword} onChange={e=>setForm(f=>({...f,newPassword:e.target.value}))} required />
          <Field label="Confirm New Password" type="password" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} required />
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>{saving?'Saving...':'Update Password'}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="font-display font-bold text-xl mb-4">Generate Token</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Token Type</label>
            <select
              value={tokenType}
              onChange={(e)=>{setTokenType(e.target.value);setToken('');setCredentials({email:'',password:''});}}
              className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none transition focus:border-accent-mint focus:ring-2 focus:ring-accent-mint/20">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {tokenType === 'admin' && (
            <>
              <Field
                label="Email"
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((c) => ({
                    ...c,
                    email: e.target.value,
                  }))
                }
                required
              />

              <Field
                label="Password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((c) => ({
                    ...c,
                    password: e.target.value,
                  }))
                }
                required
              />
            </>
          )}

          {token && (
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Generated Token
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={token}
                  className="flex-1 rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ink"
                />

                <button
                  type="button"
                  onClick={copyToken}
                  className="h-10 w-10 flex items-center justify-center rounded-xl border border-line hover:bg-panel transition"
                  title="Copy Token"
                >
                  <FiCopy size={18} />
                </button>
              </div>
            </div>
          )}

          <Button
            type="button"
            disabled={loadingToken}
            onClick={generateToken}
          >
            {loadingToken ? 'Generating...' : 'Generate Token'}
          </Button>

          <StatusBanner
            status={status}
            success={message}
            error={message}
          />
        </div>
      </Card>
    </div>
  );
}
