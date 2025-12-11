import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit2,
    Eye,
    Trash2,
    User,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useBlogStore } from '@/store/blogStore';
import type { BlogPost } from '@/lib/database.types';
import ImageUpload from '@/components/ui/ImageUpload';

// Status config
const statusConfig = {
    published: { label: 'Published', className: 'bg-green-100 text-green-700' },
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
    scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
};

// Category colors
const categoryColors: Record<string, string> = {
    'Travel Tips': 'bg-purple-100 text-purple-700',
    'Ubud Guide': 'bg-blue-100 text-blue-700',
    'Villa Features': 'bg-green-100 text-green-700',
    'Balinese Culture': 'bg-orange-100 text-orange-700',
    'Guest Stories': 'bg-pink-100 text-pink-700',
    'travel-tips': 'bg-purple-100 text-purple-700',
    'culture': 'bg-orange-100 text-orange-700',
    'food-dining': 'bg-yellow-100 text-yellow-700',
    'activities': 'bg-blue-100 text-blue-700',
    'wellness': 'bg-green-100 text-green-700',
};

const AdminBlog = () => {
    const { posts, isLoading, fetchPosts, deletePost } = useBlogStore();
    const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        return filter === 'all' ? matchesSearch : matchesSearch && post.status === filter;
    });

    const totalPages = Math.ceil(filteredPosts.length / perPage);
    const paginatedPosts = filteredPosts.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handleDelete = async (post: BlogPost) => {
        if (window.confirm(`Delete "${post.title}"?`)) {
            const success = await deletePost(post.id);
            if (success) {
                toast({ title: 'Post deleted' });
            } else {
                toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
            }
        }
    };

    if (isLoading && posts.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Blog Posts Management</h1>
                    <p className="text-sm text-[#6b7c67]">Create and manage blog content ({posts.length} posts)</p>
                </div>
                <Link to="/admin/blog/new" className="admin-btn admin-btn-primary">
                    <Plus size={18} />
                    Create New Post
                </Link>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="admin-card p-4">
                    <p className="text-2xl font-bold text-[#778873]">{posts.filter(p => p.status === 'published').length}</p>
                    <p className="text-xs text-[#6b7c67]">Published Posts</p>
                </div>
                <div className="admin-card p-4">
                    <p className="text-2xl font-bold text-[#778873]">{posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}</p>
                    <p className="text-xs text-[#6b7c67]">Total Views</p>
                </div>
                <div className="admin-card p-4">
                    <p className="text-2xl font-bold text-[#778873]">{posts.filter(p => p.status === 'draft').length}</p>
                    <p className="text-xs text-[#6b7c67]">Drafts</p>
                </div>
                <div className="admin-card p-4">
                    <p className="text-2xl font-bold text-[#778873]">{posts.filter(p => p.status === 'scheduled').length}</p>
                    <p className="text-xs text-[#6b7c67]">Scheduled</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'published', label: 'Published' },
                        { key: 'draft', label: 'Draft' },
                        { key: 'scheduled', label: 'Scheduled' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setFilter(tab.key as any);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                ? 'bg-[#778873] text-white'
                                : 'bg-[#F1F3E0] text-[#2d3a29] hover:bg-[#D2DCB6]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="admin-input pl-10"
                    />
                </div>
            </div>

            {/* Posts Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="w-12"></th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Views</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPosts.map((post) => {
                                const status = statusConfig[post.status];
                                const categoryName = post.category?.name || 'Uncategorized';

                                return (
                                    <tr key={post.id}>
                                        <td>
                                            <img
                                                src={post.featured_image || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=60&fit=crop'}
                                                alt=""
                                                className="w-12 h-8 object-cover rounded"
                                            />
                                        </td>
                                        <td>
                                            <div>
                                                <p className="font-medium text-[#2d3a29]">{post.title}</p>
                                                <p className="text-xs text-[#6b7c67] truncate max-w-xs">{post.excerpt}</p>
                                            </div>
                                        </td>
                                        <td className="text-sm text-[#6b7c67]">
                                            <div className="flex items-center gap-2">
                                                <User size={14} />
                                                {post.author_name || 'Admin'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[post.category?.slug || ''] || 'bg-gray-100 text-gray-700'}`}>
                                                {categoryName}
                                            </span>
                                        </td>
                                        <td className="text-sm text-[#6b7c67]">
                                            {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : format(new Date(post.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="font-medium">{(post.views || 0).toLocaleString()}</td>
                                        <td>
                                            <div className="flex gap-1">
                                                <Link
                                                    to={`/admin/blog/${post.id}/edit`}
                                                    className="p-2 hover:bg-[#F1F3E0] rounded-lg text-[#778873]"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-[#F1F3E0] rounded-lg text-[#778873]"
                                                >
                                                    <Eye size={16} />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(post)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[#d4dbc8]">
                        <p className="text-sm text-[#6b7c67]">
                            Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredPosts.length)} of {filteredPosts.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-[#F1F3E0] disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-[#F1F3E0] disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {filteredPosts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-[#6b7c67]">
                        {posts.length === 0
                            ? 'No posts found. Create your first blog post!'
                            : 'No posts match your filter.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminBlog;
