import { useState } from 'react';
import { authService } from '../../services/adminService';
import { Field, Button, Card, StatusBanner } from './components/ui.jsx';

export default function AdminPassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setMessage('New password and confirmation do not match.');
      setStatus('error');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword(form.currentPassword, form.newPassword);
      setMessage('Password updated successfully.');
      setStatus('success');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setMessage(err.message || 'Failed to update password.');
      setStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h2 className="font-display font-bold text-2xl mb-1">Password</h2>
        <p className="text-ink/50 text-sm">
          Forgot your current password instead? Run{' '}
          <code className="font-mono text-accent-mint">npm run admin:reset-password</code> from the
          backend.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
          />
          <Field
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            minLength={8}
            required
          />
          <Field
            label="Confirm New Password"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            minLength={8}
            required
          />
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Password'}
            </Button>
            <StatusBanner status={status} success={message} error={message} />
          </div>
        </form>
      </Card>
    </div>
  );
}
