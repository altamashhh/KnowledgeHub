import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../api/service';
import { CreateKnowledgeItemRequest } from '../../types';

export const QuickCaptureModal: React.FC = () => {
  const { isQuickCaptureOpen, closeQuickCapture, notifyItemMutated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [urlOrContent, setUrlOrContent] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdItemId, setCreatedItemId] = useState<string | number | null>(null);

  const resetForm = () => {
    setTitle('');
    setUrlOrContent('');
    setContextNotes('');
    setError(null);
    setCreatedItemId(null);
  };

  const handleClose = () => {
    resetForm();
    closeQuickCapture();
  };

  const isLikelyUrl = (text: string): boolean => {
    const trimmed = text.trim();
    return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(trimmed) || /^www\.[^\s$.?#].[^\s]*$/i.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawUrlOrContent = urlOrContent.trim();
    const rawTitle = title.trim();
    const rawContext = contextNotes.trim();

    if (!rawTitle && !rawUrlOrContent && !rawContext) {
      setError('Please provide a title, link, or note content.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalUrl: string | undefined = undefined;
      let finalContent: string | undefined = undefined;
      let inferredType: string = 'NOTE';

      if (isLikelyUrl(rawUrlOrContent)) {
        finalUrl = rawUrlOrContent.startsWith('http') ? rawUrlOrContent : `https://${rawUrlOrContent}`;
        inferredType = 'WEBSITE';
        finalContent = rawContext || undefined;
      } else {
        finalContent = [rawUrlOrContent, rawContext].filter(Boolean).join('\n\n') || undefined;
        inferredType = 'NOTE';
      }

      const itemPayload: CreateKnowledgeItemRequest = {
        title: rawTitle || (finalUrl ? new URL(finalUrl).hostname.replace('www.', '') : 'Quick Note'),
        url: finalUrl,
        content: finalContent,
        type: inferredType,
        status: 'INBOX',
        difficulty: null,
        rating: null,
        topic: null,
        tags: [],
      };

      const created = await apiService.createItem(itemPayload);
      notifyItemMutated();
      setCreatedItemId(created.id);
    } catch (err: any) {
      setError(err.message || 'Failed to save knowledge item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToItem = () => {
    if (createdItemId) {
      const id = createdItemId;
      handleClose();
      navigate(`/items/${id}`);
    }
  };

  return (
    <Modal isOpen={isQuickCaptureOpen} onClose={handleClose} title="Quick Capture" maxWidth="md">
      {createdItemId ? (
        <div className="py-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#F3F4F6]">Captured to Inbox</h4>
          <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
            Item saved. You can enrich it now with tags, topics, and difficulty, or continue capturing.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                resetForm();
              }}
            >
              Capture Another
            </Button>
            <Button type="button" variant="primary" fullWidth onClick={handleGoToItem}>
              View Item
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Title <span className="text-[#64748B] text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. PostgreSQL Indexing Strategies"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-[#0E1217] border border-[#222733] px-3.5 py-2 text-xs sm:text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              URL or Raw Content
            </label>
            <textarea
              rows={3}
              placeholder="Paste URL, markdown note, or code snippet..."
              value={urlOrContent}
              onChange={(e) => setUrlOrContent(e.target.value)}
              className="w-full rounded-lg bg-[#0E1217] border border-[#222733] px-3.5 py-2 text-xs sm:text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Context Notes <span className="text-[#64748B] text-[11px]">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Why this is useful, key takeaway, or reference tags..."
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              className="w-full rounded-lg bg-[#0E1217] border border-[#222733] px-3.5 py-2 text-xs sm:text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
            />
          </div>

          <div className="pt-2">
            <p className="text-[11px] text-[#64748B] text-center mb-3">
              Type and metadata are automatically inferred upon capture.
            </p>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<Inbox className="w-4 h-4 mr-1.5" />}
            >
              Save to Inbox
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
