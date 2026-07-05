import { useState, useRef, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import useCachedFetch from '../../hooks/useCachedFetch';
import { skillsService } from '../../services/portfolioService';
import { adminSkillsService } from '../../services/adminService';
import { Field, Button, Card } from './components/ui.jsx';
import { useToasts, ToastContainer } from './components/Toast.jsx';

const EMPTY = { category: '', items: [{ name: '', level: 80 }] };

export default function AdminSkills() {
  const { data: categories, loading, refetch } = useCachedFetch('admin_skills', skillsService.getAll, []);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const wasOpenRef = useRef(false);
  const toast = useToasts();

  // Auto-scroll to the form only when it transitions from closed -> open,
  // not on every keystroke (setEditing gives `editing` a new reference on
  // every field change, which used to re-trigger the scroll each time).
  useEffect(() => {
    const isOpen = !!editing;
    if (isOpen && !wasOpenRef.current) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
    wasOpenRef.current = isOpen;
  }, [editing ? true : false]);

  const openNew = () => setEditing(structuredClone(EMPTY));
  const openEdit = (cat) => setEditing(structuredClone({ ...cat, items: cat.items?.length ? cat.items : [{ name: '', level: 80 }] }));
  const close = () => setEditing(null);

  const updateItem = (idx, key, value) =>
    setEditing(f => { const items = [...f.items]; items[idx] = { ...items[idx], [key]: value }; return { ...f, items }; });
  const addItem = () => setEditing(f => ({ ...f, items: [...f.items, { name: '', level: 80 }] }));
  const removeItem = (idx) => setEditing(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const isNew = !editing._id;
    try {
      const payload = { category: editing.category, items: editing.items.filter(i => i.name.trim()) };
      if (editing._id) {
        await adminSkillsService.update(editing._id, payload);
      } else {
        await adminSkillsService.create(payload);
      }
      close();
      refetch();
      toast.success(isNew ? 'Skill category created successfully.' : 'Skill category updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to save skill category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this skill category?')) return;
    setDeletingId(id);
    try {
      await adminSkillsService.remove(id);
      refetch();
      toast.success('Skill category deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete skill category.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-display font-bold text-2xl mb-1">Skills</h2><p className="text-ink/50 text-sm">Skill categories and progress levels.</p></div>
        <Button onClick={openNew} className="flex items-center gap-2"><FiPlus /> Add Category</Button>
      </div>

      {loading && <p className="text-ink/50 font-mono text-sm">Loading...</p>}

      <div className="space-y-3">
        {(categories || []).map(cat => (
          <Card key={cat._id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold">{cat.category}</h3>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="p-2 text-ink/60 hover:text-accent-mint" title="Edit"><FiEdit2 size={16} /></button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  disabled={deletingId === cat._id}
                  className="p-2 text-ink/60 hover:text-red-400 disabled:opacity-40"
                  title="Delete"
                >
                  {deletingId === cat._id
                    ? <span className="block w-4 h-4 border-2 border-ink/30 border-t-red-400 rounded-full animate-spin" />
                    : <FiTrash2 size={16} />}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(cat.items || []).map(item => (
                <span key={item.name} className="text-xs font-mono px-2 py-1 rounded-full border border-line">{item.name} · {item.level}%</span>
              ))}
            </div>
          </Card>
        ))}
        {!loading && (categories || []).length === 0 && <p className="text-ink/40 font-mono text-sm">No skill categories yet.</p>}
      </div>

      {editing && (
        <Card className="space-y-4 relative" ref={formRef}>
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm text-ink/60 uppercase tracking-wider">{editing._id ? 'Edit Category' : 'New Category'}</h3>
            <Button variant="ghost" onClick={close} className="flex items-center gap-1 !py-1.5 !px-3 text-xs"><FiX size={13} /> Cancel</Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Category Name" value={editing.category}
              onChange={e => setEditing(f => ({ ...f, category: e.target.value }))} placeholder="Frontend" required />
            <div className="space-y-3">
              <span className="block font-mono text-xs text-ink/50">Skills</span>
              {editing.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="React"
                    className="flex-1 bg-transparent border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-mint" />
                  <input type="number" min={0} max={100} value={item.level} onChange={e => updateItem(idx, 'level', Number(e.target.value))}
                    className="w-20 bg-transparent border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-mint" />
                  <button type="button" onClick={() => removeItem(idx)} className="text-ink/40 hover:text-red-400"><FiTrash2 size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-accent-mint text-sm font-mono flex items-center gap-1"><FiPlus size={14} /> Add Skill</button>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={saving} className="flex items-center gap-2 min-w-[100px] justify-center">
                {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : 'Save'}
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