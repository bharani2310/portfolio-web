// import { useState } from 'react';
// import { authService } from '../../services/adminService';
// import { Field, Button, Card, StatusBanner } from './components/ui.jsx';

// export default function AdminPassword() {
//   const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
//   const [status, setStatus] = useState(null);
//   const [message, setMessage] = useState('');
//   const [saving, setSaving] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.newPassword !== form.confirm) {
//       setMessage('New password and confirmation do not match.');
//       setStatus('error');
//       return;
//     }
//     setSaving(true);
//     try {
//       await authService.changePassword(form.currentPassword, form.newPassword);
//       setMessage('Password updated successfully.');
//       setStatus('success');
//       setForm({ currentPassword: '', newPassword: '', confirm: '' });
//     } catch (err) {
//       setMessage(err.message || 'Failed to update password.');
//       setStatus('error');
//     } finally {
//       setSaving(false);
//       setTimeout(() => setStatus(null), 4000);
//     }
//   };

//   return (
//     <div className="space-y-6 max-w-md">
//       <div>
//         <h2 className="font-display font-bold text-2xl mb-1">Password</h2>
//         <p className="text-ink/50 text-sm">
//           Forgot your current password instead? Run{' '}
//           <code className="font-mono text-accent-mint">npm run admin:reset-password</code> from the
//           backend.
//         </p>
//       </div>

//       <Card>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Field
//             label="Current Password"
//             type="password"
//             value={form.currentPassword}
//             onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
//             required
//           />
//           <Field
//             label="New Password"
//             type="password"
//             value={form.newPassword}
//             onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
//             minLength={8}
//             required
//           />
//           <Field
//             label="Confirm New Password"
//             type="password"
//             value={form.confirm}
//             onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
//             minLength={8}
//             required
//           />
//           <div className="flex items-center gap-4">
//             <Button type="submit" disabled={saving}>
//               {saving ? 'Saving...' : 'Update Password'}
//             </Button>
//             <StatusBanner status={status} success={message} error={message} />
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// }




import { useState } from 'react';
import { authService } from '../../services/adminService';
import { Field, Button, Card, StatusBanner } from './components/ui.jsx';

export default function AdminPassword() {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });

  const [tokenType, setTokenType] = useState('user');
  const [credentials, setCredentials] = useState({ email:'', password:'' });
  const [token, setToken] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);

  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const clearStatus = () => {
    setTimeout(() => {
      setStatus(null);
      setMessage('');
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirm) {
      setStatus('error');
      setMessage('New password and confirmation do not match.');
      return clearStatus();
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

      const data =
        tokenType === 'user'
          ? await authService.generateUserToken(credentials.email, credentials.password)
          : await authService.generateAdminToken(credentials.email, credentials.password);

      setToken(data.token || data.accessToken || '');
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
          Forgot your current password instead? Run{' '}
          <code className="font-mono text-accent-mint">npm run admin:reset-password</code> from the backend.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current Password" type="password" value={form.currentPassword}
            onChange={(e)=>setForm(f=>({...f,currentPassword:e.target.value}))} required />
          <Field label="New Password" type="password" value={form.newPassword}
            onChange={(e)=>setForm(f=>({...f,newPassword:e.target.value}))} minLength={8} required />
          <Field label="Confirm New Password" type="password" value={form.confirm}
            onChange={(e)=>setForm(f=>({...f,confirm:e.target.value}))} minLength={8} required />

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="font-display font-bold text-xl mb-4">Generate Token</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Token Type</label>
            <select
              value={tokenType}
              onChange={(e)=>{
                setTokenType(e.target.value);
                setToken('');
              }}
              className="w-full rounded-lg border border-line bg-transparent px-3 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Field
            label="Email"
            type="email"
            value={credentials.email}
            onChange={(e)=>setCredentials(c=>({...c,email:e.target.value}))}
            required
          />

          <Field
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e)=>setCredentials(c=>({...c,password:e.target.value}))}
            required
          />

          <Button type="button" disabled={loadingToken} onClick={generateToken}>
            {loadingToken ? 'Generating...' : 'Generate Token'}
          </Button>

          {token && (
            <>
              <Field label="Generated Token" value={token} readOnly />
              <Button type="button" onClick={copyToken}>
                Copy Token
              </Button>
            </>
          )}

          <StatusBanner status={status} success={message} error={message} />
        </div>
      </Card>
    </div>
  );
}
