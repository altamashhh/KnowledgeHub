import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Edit3,
  Trash2,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Inbox,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { apiService } from '../../api/service';
import { KnowledgeItem } from '../../types';
import { Badge } from '../../components/common/Badge';
import { StarRating } from '../../components/common/StarRating';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const KnowledgeItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifyItemMutated } = useAuth();

  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchItem = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await apiService.getItemById(id);
        if (isMounted) setItem(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load knowledge item.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchItem();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await apiService.deleteItem(id);
      notifyItemMutated();
      setShowDeleteModal(false);
      navigate('/library');
    } catch (err: any) {
      alert(err.message || 'Failed to delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: 'INBOX' | 'LEARNING' | 'COMPLETED' | 'ARCHIVED') => {
    if (!item || !id) return;
    try {
      const updated = await apiService.updateItem(id, { status: newStatus });
      setItem(updated);
      notifyItemMutated();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to render content with markdown-like code blocks
  const renderFormattedContent = (content?: string) => {
    if (!content) {
      return <p className="text-[#64748B] italic text-xs">No notes or content provided for this item.</p>;
    }

    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: content.substring(lastIndex, match.index),
        });
      }

      // Code block
      parts.push({
        type: 'code',
        lang: match[1] || 'text',
        code: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-4 text-[#CBD5E1] leading-relaxed text-xs sm:text-sm">
        {parts.map((part, index) => {
          if (part.type === 'code') {
            return (
              <div key={index} className="rounded-lg overflow-hidden bg-[#0A0D12] text-[#F3F4F6] my-4 border border-[#222733] font-mono text-xs">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#11151B] border-b border-[#222733]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/70" />
                    <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
                    {part.lang && (
                      <span className="ml-2 text-[10px] text-[#64748B] font-mono uppercase">
                        {part.lang}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(part.code || '');
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#F3F4F6] transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 overflow-x-auto text-emerald-300/90 leading-relaxed font-mono text-xs">
                  <code>{part.code}</code>
                </pre>
              </div>
            );
          }

          // Format paragraphs and headers
          const paragraphs = part.value.split('\n\n');
          return (
            <React.Fragment key={index}>
              {paragraphs.map((p, pIdx) => {
                const trimmed = p.trim();
                if (trimmed.startsWith('# ')) {
                  return (
                    <h2 key={pIdx} className="text-base sm:text-lg font-bold text-[#F3F4F6] mt-4 mb-2">
                      {trimmed.replace('# ', '')}
                    </h2>
                  );
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h3 key={pIdx} className="text-sm sm:text-base font-bold text-[#F3F4F6] mt-3 mb-1.5">
                      {trimmed.replace('## ', '')}
                    </h3>
                  );
                }
                return (
                  <p key={pIdx} className="whitespace-pre-line leading-relaxed text-[#CBD5E1]">
                    {trimmed}
                  </p>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" label="Loading knowledge item..." />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4 bg-[#11151B] border border-[#222733] rounded-lg p-6">
        <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#F3F4F6]">{error || 'Item not found'}</h3>
        <Button variant="secondary" onClick={() => navigate('/library')}>
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#94A3B8] hover:text-[#F3F4F6] transition-colors p-1 -ml-1 rounded-md cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#171B22] border border-[#222733] text-indigo-400 hover:border-indigo-500/50 hover:bg-[#1E242E] font-medium text-xs transition-colors"
            >
              <span>Source URL</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-[#11151B] rounded-xl border border-[#222733] p-5 sm:p-6 space-y-5">
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight leading-snug">
          {item.title}
        </h1>

        {/* Badges & Rating */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {item.status && <Badge status={item.status} />}
          {item.difficulty && <Badge difficulty={item.difficulty} />}
          {item.type && <Badge type={item.type} />}
          {item.rating && (
            <div className="ml-auto flex items-center gap-1">
              <StarRating rating={item.rating} readOnly size="sm" />
            </div>
          )}
        </div>

        <hr className="border-[#1E242E]" />

        {/* Formatted Content & Code blocks */}
        <div>
          {renderFormattedContent(item.content)}
        </div>

        <hr className="border-[#1E242E]" />

        {/* Metadata section */}
        <div className="space-y-2.5 text-xs">
          {/* Topic */}
          {item.topic && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#64748B] w-14">TOPIC:</span>
              <Badge variant="topic">{item.topic}</Badge>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] text-[#64748B] w-14">TAGS:</span>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag, idx) => (
                  <Badge key={idx} variant="tag">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-[#64748B] pt-2 border-t border-[#1C212A] font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Captured {formatDate(item.createdAt)}
            </span>
            {item.updatedAt && item.updatedAt !== item.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {formatDate(item.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-md border-t border-[#222733] p-3.5 z-20 md:static md:bg-transparent md:border-0 md:p-0">
        <div className="max-w-2xl mx-auto flex items-center gap-2.5">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/items/${item.id}/edit`)}
            leftIcon={<Edit3 className="w-4 h-4 mr-1.5" />}
          >
            Edit / Enrich
          </Button>

          {/* Status toggle quickly */}
          {item.status !== 'COMPLETED' ? (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleStatusChange('COMPLETED')}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" />}
              title="Mark as Completed"
            >
              Complete
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleStatusChange('LEARNING')}
              leftIcon={<GraduationCap className="w-4 h-4 text-indigo-400 mr-1.5" />}
              title="Move to Learning"
            >
              Reopen
            </Button>
          )}

          <Button
            variant="danger"
            size="lg"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Knowledge Item"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Are you sure you want to delete <strong className="text-[#F3F4F6]">"{item.title}"</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
