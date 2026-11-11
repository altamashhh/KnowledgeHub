import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Tag as TagIcon,
  X,
  Plus,
  Inbox,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { apiService } from '../../api/service';
import { KnowledgeItem, UpdateKnowledgeItemRequest } from '../../types';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const SUGGESTED_TOPICS = [
  'React Ecosystem',
  'Architecture',
  'CSS & UI',
  'Rust',
  'Performance',
  'Backend',
  'Databases',
  'TypeScript',
  'Java',
  'DevOps',
];

export const KnowledgeItemEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifyItemMutated } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [status, setStatus] = useState<'INBOX' | 'LEARNING' | 'COMPLETED' | 'ARCHIVED'>('INBOX');
  const [type, setType] = useState('NOTE');

  useEffect(() => {
    let isMounted = true;
    const fetchItem = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await apiService.getItemById(id);
        if (isMounted) {
          setTitle(data.title || '');
          setUrl(data.url || '');
          setContent(data.content || '');
          setTopic(data.topic || '');
          setTags(data.tags || []);
          setDifficulty(data.difficulty as any || null);
          setRating(data.rating || null);
          setStatus((data.status as any) || 'INBOX');
          setType(data.type || 'NOTE');
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load item.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchItem();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: UpdateKnowledgeItemRequest = {
        title: title.trim(),
        url: url.trim() || undefined,
        content: content.trim() || undefined,
        topic: topic.trim() || null,
        tags: tags,
        difficulty: difficulty,
        rating: rating,
        status: status,
        type: type,
      };

      await apiService.updateItem(id, payload);
      notifyItemMutated();
      navigate(`/items/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" label="Loading item for editing..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[#94A3B8] hover:text-[#F3F4F6] p-1 -ml-1 rounded-md transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#F3F4F6]">Enrich Knowledge Item</h1>
          <p className="text-xs text-[#94A3B8]">
            Refine taxonomy, difficulty, notes, and learning status.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Edit Card Form */}
      <form onSubmit={handleSubmit} className="bg-[#11151B] rounded-xl border border-[#222733] shadow-xl p-5 sm:p-6 space-y-5">
        {/* Title */}
        <div>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Item title"
            required
          />
        </div>

        {/* URL / Source */}
        <div>
          <Input
            label="Source URL (Optional)"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
          />
        </div>

        {/* Content / Notes */}
        <div>
          <Textarea
            label="Description / Notes"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add details, code blocks, or context... (```ts code here ```)"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
            Topic
          </label>
          <input
            type="text"
            list="topics-list"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Select or enter topic (e.g. React Ecosystem)"
            className="w-full rounded-lg bg-[#0E1217] border border-[#222733] px-3.5 py-2 text-xs sm:text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
          />
          <datalist id="topics-list">
            {SUGGESTED_TOPICS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-[#171B22] border border-[#222733] text-[#CBD5E1] text-xs font-mono px-2 py-0.5 rounded-md"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-400 focus:outline-none cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag and press Enter..."
              className="flex-1 rounded-lg bg-[#0E1217] border border-[#222733] px-3.5 py-2 text-xs sm:text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors font-mono"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((diff) => {
              const isSelected = difficulty === diff;
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(isSelected ? null : diff)}
                  className={`
                    py-2 rounded-lg text-xs font-medium transition-all border cursor-pointer capitalize
                    ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs shadow-indigo-600/30'
                        : 'bg-[#0E1217] text-[#94A3B8] border-[#222733] hover:bg-[#171B22] hover:text-[#F3F4F6]'
                    }
                  `}
                >
                  {diff.toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
            Rating
          </label>
          <div className="flex items-center gap-3">
            <StarRating
              rating={rating || 0}
              onChange={(val) => setRating(val === rating ? null : val)}
              size="md"
            />
            {rating && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-xs text-[#64748B] hover:text-[#94A3B8] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
            Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('INBOX')}
              className={`
                p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer
                ${
                  status === 'INBOX'
                    ? 'bg-indigo-950/50 border-indigo-500/60 text-indigo-300 font-semibold'
                    : 'bg-[#0E1217] border-[#222733] text-[#94A3B8] hover:bg-[#171B22]'
                }
              `}
            >
              <Inbox className="w-4 h-4" />
              <span className="text-xs">Inbox</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('LEARNING')}
              className={`
                p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer
                ${
                  status === 'LEARNING'
                    ? 'bg-indigo-950/50 border-indigo-500/60 text-indigo-300 font-semibold'
                    : 'bg-[#0E1217] border-[#222733] text-[#94A3B8] hover:bg-[#171B22]'
                }
              `}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-xs">Learning</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('COMPLETED')}
              className={`
                p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer
                ${
                  status === 'COMPLETED'
                    ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300 font-semibold'
                    : 'bg-[#0E1217] border-[#222733] text-[#94A3B8] hover:bg-[#171B22]'
                }
              `}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">Completed</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-[#222733]">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4 mr-1.5" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
