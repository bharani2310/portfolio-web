import { useRef, useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { projectsService } from '../../services/portfolioService';
import { adminProjectsService } from '../../services/adminService';
import { Field, TextAreaField, Button, Card } from './components/ui.jsx';
import { useToasts, ToastContainer } from './components/Toast.jsx';

const EMPTY = { title: '', description: '', details: '', technologies: '', githubLink: '', liveLink: '' };

export default function AdminProjects() {
  const { data: projects, loading, refetch } = useFetch(projectsService.getAll, []);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const wasOpenRef = useRef(false);
  const toast = useToasts();

  // Auto-scroll to the form only when it transitions from closed -> open.
  // (Previously this depended on the whole `editing` object, which gets a
  // new reference on every keystroke — e.g. typing in the Live Link field —
  // so the page kept jumping back to the top of the form while typing.)
  useEffect(() => {
    const isOpen = !!editing;
    if (isOpen && !wasOpenRef.current) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
    wasOpenRef.current = isOpen;
  }, [editing ? true : false]);

  const openNew = () => { setEditing({ ...EMPTY }); setImageFile(null); setPreview(null); };
  const openEdit = (p) => { setEditing({ ...p, technologies: (p.technologies || []).join(', ') }); setImageFile(null); setPreview(null); };
  const close = () => setEditing(null);

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
      Object.entries(editing).forEach(([k, v]) => {
        if (k !== '_id' && k !== 'image') fd.append(k, v ?? '');
      });
      if (imageFile) fd.append('image', imageFile);

      if (editing._id) {
        await adminProjectsService.update(editing._id, fd);
      } else {
        await adminProjectsService.create(fd);
      }

      close();
      refetch();
      toast.success(isNew ? 'Project created successfully.' : 'Project updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    setDeletingId(id);
    try {
      await adminProjectsService.remove(id);
      refetch();
      toast.success('Project deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete project.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl mb-1">Projects</h2>
          <p className="text-ink/50 text-sm">Cards shown in the Projects section.</p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2"><FiPlus /> Add Project</Button>
      </div>

      {loading && <p className="text-ink/50 font-mono text-sm">Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(projects || []).map(project => (
          <Card key={project._id}>
            {project.image && (
              <img src={project.image} alt={project.title} className="w-full h-32 object-cover rounded-lg mb-3" />
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold">{project.title}</h3>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(project)} className="p-2 text-ink/60 hover:text-accent-mint" title="Edit">
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  disabled={deletingId === project._id}
                  className="p-2 text-ink/60 hover:text-red-400 disabled:opacity-40"
                  title="Delete"
                >
                  {deletingId === project._id
                    ? <span className="block w-4 h-4 border-2 border-ink/30 border-t-red-400 rounded-full animate-spin" />
                    : <FiTrash2 size={16} />}
                </button>
              </div>
            </div>
            <p className="text-ink/50 text-sm mt-1 line-clamp-2">{project.description}</p>
          </Card>
        ))}
        {!loading && (projects || []).length === 0 && <p className="text-ink/40 font-mono text-sm">No projects yet.</p>}
      </div>

      {editing && (
        <Card className="space-y-4 relative" ref={formRef}>
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm text-ink/60 uppercase tracking-wider">
              {editing._id ? 'Edit Project' : 'New Project'}
            </h3>
            <Button variant="ghost" onClick={close} className="flex items-center gap-1 !py-1.5 !px-3 text-xs">
              <FiX size={13} /> Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              {(preview || editing.image) && (
                <img src={preview || editing.image} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-line" />
              )}
              <label className="inline-block cursor-pointer">
                <span className="px-4 py-2 rounded-full border border-line text-sm font-mono hover:border-accent-mint hover:text-accent-mint">
                  {editing.image ? 'Change Image' : 'Upload Image'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <Field label="Title" value={editing.title}
              onChange={e => setEditing(f => ({ ...f, title: e.target.value }))} required />

            <TextAreaField label="Short Description (card)" rows={2} value={editing.description}
              onChange={e => setEditing(f => ({ ...f, description: e.target.value }))} required />

            <TextAreaField label="Full Details (modal)" rows={4} value={editing.details}
              onChange={e => setEditing(f => ({ ...f, details: e.target.value }))} />

            <Field label="Technologies (comma separated)" value={editing.technologies}
              onChange={e => setEditing(f => ({ ...f, technologies: e.target.value }))}
              placeholder="React, Node.js" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="GitHub Link" value={editing.githubLink}
                onChange={e => setEditing(f => ({ ...f, githubLink: e.target.value }))}
                placeholder="https://github.com/..." />
              <Field label="Live Link" value={editing.liveLink}
                onChange={e => setEditing(f => ({ ...f, liveLink: e.target.value }))}
                placeholder="https://..." />
            </div>

            <div className="flex items-center gap-3 pt-1">
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
