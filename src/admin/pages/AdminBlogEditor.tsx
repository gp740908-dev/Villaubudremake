import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Eye,
    Upload,
    X,
    Globe,
    Lock,
    Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useBlogStore } from '@/store/blogStore';
import { useAuthStore } from '@/store/authStore';
import RichTextEditor from '@/components/ui/RichTextEditor';
import type { BlogPost } from '@/lib/database.types';

const AdminBlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const { posts, categories, fetchPosts, fetchCategories, createPost, updatePost, getPostById } = useBlogStore();
    const { user } = useAuthStore();

    // Form state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
    const [publishDate, setPublishDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load post data if editing
    useEffect(() => {
        const loadData = async () => {
            await fetchCategories();
            if (posts.length === 0) {
                await fetchPosts();
            }

            if (isEditing && id) {
                const post = getPostById(id);
                if (post) {
                    setTitle(post.title);
                    setSlug(post.slug);
                    setContent(post.content || '');
                    setExcerpt(post.excerpt || '');
                    setFeaturedImage(post.featured_image || '');
                    setCategoryId(post.category_id || '');
                    setTags(post.tags || []);
                    setStatus(post.status);
                    if (post.published_at) {
                        setPublishDate(post.published_at.slice(0, 16));
                    }
                }
            }
            setIsLoading(false);
        };
        loadData();
    }, [id, isEditing, posts.length]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEditing && title) {
            setSlug(
                title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
            );
        }
    }, [title, isEditing]);

    // Handle tag input
    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    // Save handlers
    const handleSave = async (newStatus?: 'draft' | 'published') => {
        if (!title.trim()) {
            toast({ title: 'Title required', variant: 'destructive' });
            return;
        }

        if (!slug.trim()) {
            toast({ title: 'Slug required', variant: 'destructive' });
            return;
        }

        setIsSaving(true);

        const postData: Partial<BlogPost> = {
            title,
            slug,
            content,
            excerpt,
            featured_image: featuredImage || null,
            category_id: categoryId || null,
            tags,
            status: newStatus || status,
            author_id: user?.id,
            author_name: user?.name,
            published_at: newStatus === 'published' ? new Date().toISOString() : (status === 'scheduled' ? publishDate : null),
        };

        try {
            if (isEditing && id) {
                await updatePost(id, postData);
                toast({ title: 'Post updated', description: 'Your changes have been saved.' });
            } else {
                await createPost(postData as any);
                toast({ title: newStatus === 'published' ? 'Post published!' : 'Draft saved' });
            }

            setLastSaved(new Date());

            if (newStatus === 'published') {
                navigate('/admin/blog');
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to save post.', variant: 'destructive' });
        }

        setIsSaving(false);
    };

    const handlePreview = () => {
        if (slug) {
            window.open(`/blog/${slug}`, '_blank');
        } else {
            toast({ title: 'Preview', description: 'Please add a slug first.' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen -m-6 bg-[#F1F3E0]">
            {/* Header */}
            <div className="bg-white border-b border-[#d4dbc8] sticky top-0 z-20">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/blog"
                            className="p-2 hover:bg-[#F1F3E0] rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-[#778873]" />
                        </Link>
                        <div>
                            <h1 className="font-semibold text-[#2d3a29]">
                                {isEditing ? 'Edit Post' : 'Create New Post'}
                            </h1>
                            {lastSaved && (
                                <p className="text-xs text-[#6b7c67]">
                                    Last saved: {lastSaved.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePreview} className="admin-btn admin-btn-outline">
                            <Eye size={16} />
                            Preview
                        </button>
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={isSaving}
                            className="admin-btn admin-btn-outline"
                        >
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                            onClick={() => handleSave('published')}
                            disabled={isSaving}
                            className="admin-btn admin-btn-primary"
                        >
                            <Save size={16} />
                            Publish
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex gap-6 p-6">
                {/* Left: Editor */}
                <div className="flex-1 space-y-4">
                    {/* Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Post title..."
                        className="w-full text-3xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 text-[#2d3a29] placeholder-[#d4dbc8]"
                    />

                    {/* Permalink */}
                    <div className="flex items-center gap-2 text-sm text-[#6b7c67]">
                        <span>Permalink:</span>
                        <span className="text-[#778873]">https://stayinubud.com/blog/</span>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="bg-white px-2 py-1 rounded border border-[#d4dbc8] text-sm focus:outline-none focus:border-[#A1BC98]"
                        />
                    </div>

                    {/* Rich Text Editor */}
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Write your post content here..."
                        className="min-h-[500px]"
                    />
                </div>

                {/* Right: Sidebar */}
                <div className="w-80 space-y-4">
                    {/* Publish Settings */}
                    <div className="admin-card p-4">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Publish Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="admin-input"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="scheduled">Scheduled</option>
                                </select>
                            </div>
                            {status === 'scheduled' && (
                                <div>
                                    <label className="block text-sm font-medium text-[#2d3a29] mb-2">Publish Date</label>
                                    <input
                                        type="datetime-local"
                                        value={publishDate}
                                        onChange={(e) => setPublishDate(e.target.value)}
                                        className="admin-input"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="admin-card p-4">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Featured Image</h3>
                        <ImageUpload
                            value={featuredImage}
                            onChange={(url) => setFeaturedImage(url as string)}
                        />
                    </div>

                    {/* Categories & Tags */}
                    <div className="admin-card p-4">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Categories & Tags</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Category</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="admin-input"
                                >
                                    <option value="">Select category...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Tags</label>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Press Enter to add..."
                                    className="admin-input"
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#F1F3E0] rounded text-sm"
                                        >
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="text-[#6b7c67] hover:text-red-500">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="admin-card p-4">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Excerpt</h3>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            className="admin-input"
                            rows={3}
                            placeholder="Brief summary of the post..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBlogEditor;
