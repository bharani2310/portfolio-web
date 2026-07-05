import { useEffect, useState } from 'react';
import useCachedFetch from '../../hooks/useCachedFetch';
import { profileService } from '../../services/portfolioService';
import { adminProfileService } from '../../services/adminService';
import { Field, TextAreaField, Button, Card } from './components/ui.jsx';
import { useToasts, ToastContainer } from './components/Toast.jsx';

const SOCIAL_KEYS = ['github', 'linkedin', 'twitter', 'email'];

export default function AdminProfile() {
  const { data: profile, loading, refetch } = useCachedFetch('admin_profile', profileService.get, []);
  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToasts();

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        role: profile.role || '',
        description: profile.description || '',
        professionalSummary: profile.professionalSummary || '',
        currentCompany: profile.currentCompany || '',
        location: profile.location || '',
        resumeLink: profile.resumeLink || '',
        socialLinks: { ...profile.socialLinks },
      });
    }
  }, [profile]);

  if (loading || !form) return <p className="text-ink/50 font-mono text-sm">Loading...</p>;

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const handleSocialChange = (key, value) =>
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'socialLinks') fd.append('socialLinks', JSON.stringify(value));
        else fd.append(key, value);
      });
      if (imageFile) fd.append('image', imageFile);

      await adminProfileService.update(fd);
      toast.success('Profile updated successfully.');
      setImageFile(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl mb-1">Profile</h2>
        <p className="text-ink/50 text-sm">Shown in the Hero and About sections.</p>
      </div>

      <Card className="flex items-center gap-5">
        <img
          src={preview || profile?.profileImage || ''}
          alt="Profile preview"
          className="w-20 h-20 rounded-2xl object-cover border border-line bg-bg"
        />
        <div>
          <label className="inline-block">
            <span className="px-4 py-2 rounded-full border border-line text-sm font-mono cursor-pointer hover:border-accent-mint hover:text-accent-mint">
              Change Photo
            </span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <p className="text-ink/40 text-xs mt-2 font-mono">JPG/PNG, up to 5MB</p>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
          <Field label="Role" value={form.role} onChange={(e) => handleChange('role', e.target.value)} required />
        </div>
        <TextAreaField
          label="Hero Description"
          rows={3}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
        />
        <TextAreaField
          label="Professional Summary (About section)"
          rows={3}
          value={form.professionalSummary}
          onChange={(e) => handleChange('professionalSummary', e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Current Company"
            value={form.currentCompany}
            onChange={(e) => handleChange('currentCompany', e.target.value)}
          />
          <Field label="Location" value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
        </div>
        <Field
          label="Resume Link"
          value={form.resumeLink}
          onChange={(e) => handleChange('resumeLink', e.target.value)}
          placeholder="https://..."
        />
      </Card>

      <Card className="space-y-4">
        <h3 className="font-mono text-sm text-ink/60 uppercase tracking-wider">Social Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIAL_KEYS.map((key) => (
            <Field
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={form.socialLinks?.[key] || ''}
              onChange={(e) => handleSocialChange(key, e.target.value)}
              placeholder={key === 'email' ? 'mailto:you@example.com' : 'https://...'}
            />
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving} className="flex items-center gap-2 min-w-[130px] justify-center">
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : 'Save Changes'}
        </Button>
      </div>

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </form>
  );
}