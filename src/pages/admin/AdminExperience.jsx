import { useState, useRef, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBriefcase } from 'react-icons/fi';
import useCachedFetch from '../../hooks/useCachedFetch';
import { experienceService } from '../../services/portfolioService';
import { adminExperienceService } from '../../services/adminService';
import { Field, TextAreaField, SelectField, Button, Card } from './components/ui.jsx';
import { sortExperienceLatestFirst, sortRolesLatestFirst } from '../../utils/experienceSort';
import { useToasts, ToastContainer } from './components/Toast.jsx';

const EMPTY_ROLE = { role: '', startDate: '', endDate: '', description: '' };
const EMPTY = { companyName: '', workplaceType: '', location: '', roles: [{ ...EMPTY_ROLE }], technologies: '' };

// Same "total time at this company" calculation used on the public
// Experience section — spans earliest role start to latest role end (or
// now, if still ongoing) — shown next to the company name in the list.
function calcTotalDuration(roles = []) {
  if (!roles.length) return null;
  const starts = roles.map((r) => new Date(r.startDate).getTime());
  const ends = roles.map((r) => (r.endDate ? new Date(r.endDate).getTime() : Date.now()));
  const earliestStart = Math.min(...starts);
  const latestEnd = Math.max(...ends);
  let months =
    new Date(latestEnd).getFullYear() * 12 + new Date(latestEnd).getMonth() -
    (new Date(earliestStart).getFullYear() * 12 + new Date(earliestStart).getMonth());
  if (months < 1) months = 1;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}

export default function AdminExperience() {
  const { data: items, loading, refetch } = useCachedFetch('admin_experience', experienceService.getAll, []);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const roleRefs = useRef([]);
  const wasOpenRef = useRef(false);
  const roleCountRef = useRef(0);
  const toast = useToasts();

  // Auto-scroll to the form only when it transitions from closed -> open.
  // (Previously this depended on the whole `editing` object, which gets a
  // new reference on every keystroke, so the page kept jumping back to the
  // top of the form while typing.)
  useEffect(() => {
    const isOpen = !!editing;
    if (isOpen && !wasOpenRef.current) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
    wasOpenRef.current = isOpen;
    roleCountRef.current = editing?.roles?.length || 0;
  }, [editing ? true : false]);

  // Scroll the newly-added role card into view when a role is appended
  // (e.g. adding a second role for the same company) — the form itself
  // may already be open/on-screen, so scrolling the form container alone
  // wasn't bringing the new role into view.
  useEffect(() => {
    const count = editing?.roles?.length || 0;
    if (count > roleCountRef.current) {
      setTimeout(() => {
        roleRefs.current[count - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
    roleCountRef.current = count;
  }, [editing?.roles?.length]);

  const openNew = () => {
    setEditing({ ...EMPTY, roles: [{ ...EMPTY_ROLE }] });
    setImageFile(null);
    setPreview(null);
  };
  const openEdit = (item) => {
    setEditing({
      ...item,
      workplaceType: item.workplaceType || '',
      location: item.location || '',
      technologies: (item.technologies || []).join(', '),
      roles: sortRolesLatestFirst(item.roles || []).map(r => ({
        ...r,
        startDate: r.startDate ? r.startDate.slice(0, 10) : '',
        endDate: r.endDate ? r.endDate.slice(0, 10) : '',
      })),
    });
    setImageFile(null);
    setPreview(null);
  };
  const close = () => setEditing(null);

  const updateRole = (idx, key, value) =>
    setEditing(f => {
      const roles = [...f.roles];
      roles[idx] = { ...roles[idx], [key]: value };
      return { ...f, roles };
    });

  const addRole = () => setEditing(f => ({ ...f, roles: [...f.roles, { ...EMPTY_ROLE }] }));
  const removeRole = (idx) => setEditing(f => ({ ...f, roles: f.roles.filter((_, i) => i !== idx) }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const isNew = !editing._id;
    try {
      const fd = new FormData();
      fd.append('companyName', editing.companyName);
      fd.append('workplaceType', editing.workplaceType || '');
      fd.append('location', editing.location || '');
      fd.append('technologies', editing.technologies);
      fd.append('roles', JSON.stringify(editing.roles));
      if (imageFile) fd.append('image', imageFile);

      if (editing._id) {
        await adminExperienceService.update(editing._id, fd);
      } else {
        await adminExperienceService.create(fd);
      }
      close();
      refetch();
      toast.success(isNew ? 'Experience entry created successfully.' : 'Experience entry updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to save experience entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this experience entry?')) return;
    setDeletingId(id);
    try {
      await adminExperienceService.remove(id);
      refetch();
      toast.success('Experience entry deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete experience entry.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl mb-1">Experience</h2>
          <p className="text-ink/50 text-sm">Companies and roles shown in the Experience section.</p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2"><FiPlus /> Add</Button>
      </div>

      {loading && <p className="text-ink/50 font-mono text-sm">Loading...</p>}

      <div className="space-y-3">
        {sortExperienceLatestFirst(items || []).map(item => (
          <Card key={item._id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.companyName}
                    className="w-11 h-11 rounded-lg object-cover border border-line shrink-0 bg-bg"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg border border-line bg-bg-surface flex items-center justify-center shrink-0">
                    <FiBriefcase className="text-ink/30" size={18} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="font-display font-semibold truncate">{item.companyName}</h3>
                    {calcTotalDuration(item.roles) && (
                      <span className="shrink-0 font-mono text-xs text-accent-mint whitespace-nowrap">
                        {calcTotalDuration(item.roles)}
                      </span>
                    )}
                  </div>
                  {(item.workplaceType || item.location) && (
                    <p className="font-mono text-xs text-ink/40 mb-1">
                      {item.workplaceType}
                      {item.workplaceType && item.location && ' · '}
                      {item.location}
                    </p>
                  )}
                  {(item.roles || []).map((r, i) => (
                    <p key={i} className="font-mono text-xs text-ink/50">{r.role}</p>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 text-ink/60 hover:text-accent-mint" title="Edit"><FiEdit2 size={16} /></button>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                  className="p-2 text-ink/60 hover:text-red-400 disabled:opacity-40"
                  title="Delete"
                >
                  {deletingId === item._id
                    ? <span className="block w-4 h-4 border-2 border-ink/30 border-t-red-400 rounded-full animate-spin" />
                    : <FiTrash2 size={16} />}
                </button>
              </div>
            </div>
          </Card>
        ))}
        {!loading && (items || []).length === 0 && <p className="text-ink/40 font-mono text-sm">No experience entries yet.</p>}
      </div>

      {editing && (
        <Card className="space-y-5 relative" ref={formRef}>
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm text-ink/60 uppercase tracking-wider">
              {editing._id ? 'Edit Entry' : 'New Entry'}
            </h3>
            <Button variant="ghost" onClick={close} className="flex items-center gap-1 !py-1.5 !px-3 text-xs">
              <FiX size={13} /> Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              {(preview || editing.image) ? (
                <img
                  src={preview || editing.image}
                  alt="Company logo preview"
                  className="w-16 h-16 rounded-xl object-cover border border-line bg-bg"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl border border-line bg-bg-surface flex items-center justify-center shrink-0">
                  <FiBriefcase className="text-ink/30" size={22} />
                </div>
              )}
              <label className="inline-block">
                <span className="px-4 py-2 rounded-full border border-line text-sm font-mono cursor-pointer hover:border-accent-mint hover:text-accent-mint">
                  {editing.image ? 'Change Logo' : 'Upload Logo'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <Field label="Company Name" value={editing.companyName}
              onChange={e => setEditing(f => ({ ...f, companyName: e.target.value }))} required />

            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Workplace Type" value={editing.workplaceType || ''}
                onChange={e => setEditing(f => ({ ...f, workplaceType: e.target.value }))}>
                <option value="">Not set</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
              </SelectField>
              <Field label="Location" value={editing.location || ''}
                onChange={e => setEditing(f => ({ ...f, location: e.target.value }))}
                placeholder="Chennai, Tamil Nadu" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink/50 uppercase tracking-wider">Roles at this company</span>
                <button type="button" onClick={addRole} className="text-accent-mint text-xs font-mono flex items-center gap-1"><FiPlus size={12} /> Add Role</button>
              </div>
              {editing.roles.map((r, idx) => (
                <div
                  key={idx}
                  ref={el => { roleRefs.current[idx] = el; }}
                  className="p-4 rounded-xl border border-line space-y-3 relative"
                >
                  {editing.roles.length > 1 && (
                    <button type="button" onClick={() => removeRole(idx)} className="absolute top-3 right-3 text-ink/40 hover:text-red-400"><FiTrash2 size={13} /></button>
                  )}
                  <Field label="Role / Title" value={r.role}
                    onChange={e => updateRole(idx, 'role', e.target.value)} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start Date" type="date" value={r.startDate}
                      onChange={e => updateRole(idx, 'startDate', e.target.value)} required />
                    <Field label="End Date (blank = Present)" type="date" value={r.endDate || ''}
                      onChange={e => updateRole(idx, 'endDate', e.target.value)} />
                  </div>
                  <TextAreaField label="Description" rows={2} value={r.description || ''}
                    onChange={e => updateRole(idx, 'description', e.target.value)} />
                </div>
              ))}
            </div>

            <Field label="Technologies (comma separated)" value={editing.technologies}
              onChange={e => setEditing(f => ({ ...f, technologies: e.target.value }))}
              placeholder="React, Node.js, MongoDB" />

            <div className="flex items-center gap-3 pt-1">
              {/* #4 — saving indicator */}
              <Button type="submit" disabled={saving} className="flex items-center gap-2 min-w-[100px] justify-center">
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                ) : 'Save'}
              </Button>
              <Button variant="ghost" type="button" onClick={close}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}
