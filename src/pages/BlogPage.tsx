"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Clock, Calendar, ArrowRight, Loader2 } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useBlogStore } from "@/store/blogStore"
import type { BlogPost as DbBlogPost } from "@/lib/database.types"

// Helper to calculate read time
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute) || 1
}

// Frontend Interface
interface FrontendBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  featuredImage: string
  author: string
  authorAvatar: string
  category: string
  publishedDate: string
  readTime: number
}

const mapDbPostToFrontend = (post: DbBlogPost): FrontendBlogPost => {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    featuredImage:
      post.featured_image || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop",
    author: post.author_name || "Admin",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", // Default avatar
    category: post.category?.name || "Uncategorized",
    publishedDate: post.published_at || post.created_at,
    readTime: calculateReadTime(post.content || ""),
  }
}

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [visiblePosts, setVisiblePosts] = useState(6)

  // Store
  const { posts: dbPosts, categories: dbCategories, fetchPosts, fetchCategories, isLoading } = useBlogStore()

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [fetchPosts, fetchCategories])

  // Derived State
  const blogPosts = dbPosts.filter((p) => p.status === "published").map(mapDbPostToFrontend)

  const categories = ["All", ...dbCategories.map((c) => c.name)]

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All" || post.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null

  const loadMore = () => {
    setVisiblePosts((prev) => prev + 6)
  }

  return (
    <div className="min-h-screen bg-[#F1F3E0]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-serif font-bold text-[#2d3a29] mb-4">Ubud Travel Guide & Villa Tips</h1>
          <p className="text-xl text-[#6b7c67] max-w-2xl mx-auto mb-8">
            Discover the best of Bali through our curated articles and insider tips
          </p>
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-4 rounded-full border border-[#d4dbc8] bg-white focus:outline-none focus:border-[#A1BC98] shadow-sm font-sans"
            />
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[#6b7c67]" />
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <section className="pb-12 px-4">
              <div className="max-w-6xl mx-auto">
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="block relative rounded-2xl overflow-hidden shadow-xl group"
                >
                  <img
                    src={featuredPost.featuredImage || "/placeholder.svg"}
                    alt={featuredPost.title}
                    className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block px-3 py-1 bg-[#A1BC98] text-sm font-medium text-[#2d3a29] rounded-full mb-4">
                      Featured
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">{featuredPost.title}</h2>
                    <p className="text-white/80 max-w-2xl mb-4">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 text-white/70 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(featuredPost.publishedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {featuredPost.readTime} min read
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* Category Filter */}
          <section className="pb-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? "bg-[#778873] text-white"
                        : "bg-white text-[#6b7c67] hover:bg-[#D2DCB6]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Blog Grid */}
          <section className="py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.slice(0, visiblePosts).map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={post.featuredImage || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 text-xs font-medium text-[#778873] rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-[#2d3a29] mb-2 line-clamp-2 group-hover:text-[#778873] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[#6b7c67] mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorAvatar || "/placeholder.svg"}
                            alt={post.author}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-[#6b7c67]">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#6b7c67]">
                          <span>{post.readTime} min</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More */}
              {visiblePosts < filteredPosts.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#778873] text-white font-semibold rounded-full hover:bg-[#2d3a29] transition-colors"
                  >
                    Load More Posts
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#6b7c67]">No articles found matching your criteria.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  )
}

export default BlogPage
