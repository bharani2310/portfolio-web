import { useEffect, useMemo, useState } from 'react';
import { FiRefreshCcw,FiTrash2, FiArrowLeft } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { adminContactService } from '../../services/adminService';
import { useToasts, ToastContainer } from './components/Toast.jsx';
import {flushContacts} from '../../api/flushContacts.js';

function getTime(msg) {
  return new Date(msg.createdDate || msg.createdAt).getTime();
}

/** Groups flat message rows into one conversation per sender email,
 *  newest conversation first — like a WhatsApp chat list. */
function groupConversations(messages) {
  const map = new Map();
  for (const msg of messages) {
    if (!map.has(msg.email)) map.set(msg.email, []);
    map.get(msg.email).push(msg);
  }

  const conversations = Array.from(map.entries()).map(([email, msgs]) => {
    const sorted = [...msgs].sort((a, b) => getTime(a) - getTime(b));
    const latest = sorted[sorted.length - 1];
    return {
      email,
      name: latest.name,
      messages: sorted,
      latest,
      unreadCount: sorted.filter((m) => !m.read).length,
    };
  });

  conversations.sort((a, b) => getTime(b.latest) - getTime(a.latest));
  return conversations;
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}

function formatListTime(msg) {
  const d = new Date(msg.createdDate || msg.createdAt);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Avatar({ name, size = 'md' }) {
  const dim = size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${dim} rounded-full bg-accent-violet/20 text-accent-violet flex items-center justify-center font-display font-bold shrink-0`}>
      {initials(name)}
    </div>
  );
}

function ConversationList({ conversations, loading, onOpen, onDelete }) {
  if (!loading && conversations.length === 0) {
    return <p className="text-ink/40 font-mono text-sm">No messages yet.</p>;
  }
  return (
    <div className="rounded-2xl border border-line glass divide-y divide-line overflow-hidden">
      {conversations.map((c) => (
        <div
          key={c.email}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(c)}
          onKeyDown={(e) => { if (e.key === 'Enter') onOpen(c); }}
          className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-line/20 transition-colors cursor-pointer group"
        >
          <Avatar name={c.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`font-display truncate ${c.unreadCount > 0 ? 'font-bold text-ink' : 'font-semibold text-ink/90'}`}>
                {c.name}
              </h3>
              <span className="font-mono text-[11px] text-ink/40 shrink-0">{formatListTime(c.latest)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <p className={`text-sm truncate ${c.unreadCount > 0 ? 'text-ink/90' : 'text-ink/50'}`}>
                {c.latest.message}
              </p>
              {c.unreadCount > 0 && (
                <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-accent-mint text-bg text-[11px] font-bold flex items-center justify-center">
                  {c.unreadCount}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(c.email); }}
            className="opacity-60 md:opacity-0 md:group-hover:opacity-100 p-2 text-ink/40 hover:text-red-400 transition-opacity shrink-0"
            title="Delete conversation"
            aria-label="Delete conversation"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function ChatThread({ convo, onBack, onDeleteMessage, deletingId }) {
  return (
    <div className="rounded-2xl border border-line glass overflow-hidden flex flex-col" style={{ minHeight: '65vh' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-line shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-1 text-ink/60 hover:text-ink rounded-full hover:bg-line/30 transition-colors"
          title="Back to all messages"
          aria-label="Back to all messages"
        >
          <FiArrowLeft size={18} />
        </button>
        <Avatar name={convo.name} />
        <div className="min-w-0">
          <h3 className="font-display font-semibold truncate">{convo.name}</h3>
          <a href={`mailto:${convo.email}`} className="font-mono text-xs text-accent-mint truncate block">
            {convo.email}
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {convo.messages.map((m) => (
          <div key={m._id} className="flex justify-start group">
            <div className="max-w-[85%] sm:max-w-[65%] bg-line/30 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <p className="text-sm text-ink/90 leading-relaxed whitespace-pre-wrap break-words">{m.message}</p>
              <div className="flex items-center gap-2 mt-1.5 justify-end">
                <span className="font-mono text-[10px] text-ink/40">
                  {new Date(m.createdDate || m.createdAt).toLocaleString([], {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <button
                  onClick={() => onDeleteMessage(m._id)}
                  disabled={deletingId === m._id}
                  className="opacity-0 group-hover:opacity-100 text-ink/30 hover:text-red-400 transition-opacity disabled:opacity-40"
                  title="Delete message"
                  aria-label="Delete message"
                >
                  {deletingId === m._id
                    ? <span className="block w-3 h-3 border-2 border-ink/30 border-t-red-400 rounded-full animate-spin" />
                    : <FiTrash2 size={12} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminMessages() {
  const { data: messages, loading, refetch } = useFetch(adminContactService.getAll, []);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [flushing, setFlushing] = useState(false);
  const toast = useToasts();

  const conversations = useMemo(() => groupConversations(messages || []), [messages]);
  const selected = conversations.find((c) => c.email === selectedEmail) || null;
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // If the open conversation's last message just got deleted (or the whole
  // thread was removed), fall back to the overview instead of showing an
  // empty chat pane.
  useEffect(() => {
    if (selectedEmail && !conversations.some((c) => c.email === selectedEmail)) {
      setSelectedEmail(null);
    }
  }, [conversations, selectedEmail]);

  const openConversation = async (convo) => {
    setSelectedEmail(convo.email);
    if (convo.unreadCount > 0) {
      try {
        await adminContactService.markConversationRead(convo.email);
        refetch(true); // silent — don't flash the whole panel to "Loading..."
      } catch {
        // Non-critical — the messages are still viewable even if the
        // read-state update fails, so we don't interrupt with a toast.
      }
    }
  };

  const handleFlush = async () => {
    if (flushing) return; // already in flight — ignore double-clicks
    setFlushing(true);
    try {
      const { flushed, remaining } = await flushContacts();
      await refetch(true);
      if (flushed > 0) {
        toast.success(
          `New ${flushed} message${flushed === 1 ? '' : 's'}.` +
            (remaining > 0 ? ` ${remaining} still pending to receive.` : '')
        );
      } else {
        toast.success('No pending messages.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to Refresh.');
    } finally {
      setFlushing(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    setDeletingId(id);
    try {
      await adminContactService.remove(id);
      await refetch(true);
      toast.success('Message deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete message.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteConversation = async (email) => {
    if (!confirm('Delete this entire conversation? This cannot be undone.')) return;
    try {
      await adminContactService.removeConversation(email);
      await refetch(true);
      toast.success('Conversation deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete conversation.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-display font-bold text-2xl">
            Messages
          </h2>

          <button
            onClick={handleFlush}
            disabled={flushing}
            className="p-1.5 rounded-full text-ink/60 hover:text-accent-mint hover:bg-line/30 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            title="Refresh"
            aria-label="Refresh messages"
          >
            <FiRefreshCcw size={18} className={flushing ? 'animate-spin' : ''} />
          </button>

          {totalUnread > 0 && (
            <span className="ml-2 min-w-[24px] h-6 px-2 rounded-full bg-accent-mint text-bg text-xs font-bold flex items-center justify-center">
              {totalUnread} unread
            </span>
          )}
        </div>

        <p className="text-ink/50 text-sm">
          Submissions from your Contact form.
        </p>
      </div>

      {loading && <p className="text-ink/50 font-mono text-sm">Loading...</p>}

      {!loading && (
        selected ? (
          <ChatThread
            convo={selected}
            onBack={() => setSelectedEmail(null)}
            onDeleteMessage={handleDeleteMessage}
            deletingId={deletingId}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            loading={loading}
            onOpen={openConversation}
            onDelete={handleDeleteConversation}
          />
        )
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}
