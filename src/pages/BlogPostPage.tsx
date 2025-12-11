import { useParams, Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    ChevronRight,
    Facebook,
    Twitter,
    Link as LinkIcon,
    MessageCircle,
    Loader2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { useBlogStore } from '@/store/blogStore';
import { useEffect, useMemo } from 'react';
import { BlogPost as DbBlogPost } from '@/lib/database.types';

// Same mapping helper (can be moved to utils if shared heavily)
const mapDbPostToFrontend = (post: DbBlogPost) => {
    return {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        featuredImage: post.featured_image || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop',
        author: post.author_name || 'Admin',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        authorBio: 'The StayinUBUD team shares insider tips and local knowledge to help you experience the best of Ubud.',
        category: post.category?.name || 'Uncategorized',
        publishedDate: post.published_at || post.created_at,
        readTime: Math.ceil((post.content?.split(/\s+/).length || 0) / 200) || 1,
        content: post.content || ''
    };
};

const BlogPostPage = () => {
    const { slug } = useParams();
    const { posts: dbPosts, fetchPosts, isLoading } = useBlogStore();

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const post = useMemo(() => {
        const found = dbPosts.find(p => p.slug === slug);
        if (!found) return null;
        return mapDbPostToFrontend(found);
    }, [slug, dbPosts]);

    const relatedPosts = useMemo(() => {
        if (!post) return [];
        return dbPosts
            .filter(p => p.slug !== slug && p.status === 'published')
            .slice(0, 3)
            .map(p => ({
                slug: p.slug,
                title: p.title,
                image: p.featured_image || 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&fit=crop',
                category: p.category?.name || 'Uncategorized'
            }));
    }, [slug, dbPosts, post]);

    const handleShare = (platform: string) => {
        const url = window.location.href;
        let shareUrl = '';
        if (!post) return;

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                toast({ title: 'Link copied!', description: 'Article link has been copied to clipboard.' });
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F1F3E0] flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[#6b7c67]" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#F1F3E0] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#2d3a29] mb-4">Article not found</h2>
                    <Link to="/blog" className="text-[#778873] hover:underline">Back to Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F1F3E0]">
            <Navbar />

            {/* Hero Image */}
            <section className="relative h-[50vh] md:h-[60vh]">
                <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
            </section>

            <article className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-white/80 mb-6">
                    <Link to="/" className="hover:text-white">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/blog" className="hover:text-white">Blog</Link>
                    <ChevronRight size={14} />
                    <span>{post.category}</span>
                </nav>

                {/* Article Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    {/* Category Badge */}
                    <span className="inline-block px-3 py-1 bg-[#A1BC98]/30 text-sm font-medium text-[#778873] rounded-full mb-4">
                        {post.category}
                    </span>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2d3a29] mb-6">
                        {post.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-[#6b7c67] mb-8 pb-8 border-b border-[#d4dbc8]">
                        <div className="flex items-center gap-2">
                            <img
                                src={post.authorAvatar}
                                alt={post.author}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {new Date(post.publishedDate).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            {post.readTime} min read
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#2d3a29] prose-p:text-[#6b7c67] prose-a:text-[#778873] prose-blockquote:border-[#A1BC98] prose-blockquote:bg-[#F1F3E0] prose-blockquote:rounded-lg prose-blockquote:p-4">
                        {post.content.split('\n\n').map((paragraph, index) => {
                            if (paragraph.startsWith('## ')) {
                                return <h2 key={index} className="mt-8 mb-4 text-2xl font-bold">{paragraph.replace('## ', '')}</h2>;
                            }
                            if (paragraph.startsWith('> ')) {
                                return <blockquote key={index} className="my-6">{paragraph.replace('> ', '')}</blockquote>;
                            }
                            // Only render non-empty paragraphs
                            if (paragraph.trim()) {
                                return <p key={index} className="mb-4">{paragraph}</p>;
                            }
                            return null;
                        })}
                    </div>

                    {/* Share Buttons */}
                    <div className="flex items-center gap-4 mt-8 pt-8 border-t border-[#d4dbc8]">
                        <span className="text-sm font-medium text-[#2d3a29]">Share:</span>
                        <button
                            onClick={() => handleShare('facebook')}
                            className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center text-[#778873] hover:bg-[#3b5998] hover:text-white transition-colors"
                        >
                            <Facebook size={18} />
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center text-[#778873] hover:bg-[#1da1f2] hover:text-white transition-colors"
                        >
                            <Twitter size={18} />
                        </button>
                        <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center text-[#778873] hover:bg-[#25D366] hover:text-white transition-colors"
                        >
                            <MessageCircle size={18} />
                        </button>
                        <button
                            onClick={() => handleShare('copy')}
                            className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center text-[#778873] hover:bg-[#778873] hover:text-white transition-colors"
                        >
                            <LinkIcon size={18} />
                        </button>
                    </div>

                    {/* Author Bio */}
                    <div className="mt-8 p-6 bg-[#F1F3E0] rounded-xl flex items-start gap-4">
                        <img
                            src={post.authorAvatar}
                            alt={post.author}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h4 className="font-semibold text-[#2d3a29]">{post.author}</h4>
                            <p className="text-sm text-[#6b7c67] mt-1">{post.authorBio}</p>
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="py-12">
                        <h3 className="text-2xl font-serif font-bold text-[#2d3a29] mb-8">Related Articles</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedPosts.map((related) => (
                                <Link
                                    key={related.slug}
                                    to={`/blog/${related.slug}`}
                                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={related.image}
                                            alt={related.title}
                                            className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 text-xs font-medium text-[#778873] rounded-full">
                                            {related.category}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-[#2d3a29] line-clamp-2 group-hover:text-[#778873] transition-colors">
                                            {related.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Newsletter CTA */}
                <section className="bg-[#778873] rounded-2xl p-8 text-center mb-12">
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">
                        Subscribe to Our Newsletter
                    </h3>
                    <p className="text-white/80 mb-6">
                        Get travel tips and exclusive offers delivered to your inbox
                    </p>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Your email"
                            className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#A1BC98]"
                        />
                        <button className="px-6 py-3 bg-[#2d3a29] text-white font-semibold rounded-lg hover:bg-black transition-colors">
                            Subscribe
                        </button>
                    </div>
                </section>
            </article>

            <Footer />
        </div>
    );
};

export default BlogPostPage;
