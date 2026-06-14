'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/utils/supabase/client'

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string
  image_url: string | null; author: string; published_at: string; tags: string[]
}

export function BlogSection({ tenantId }: { tenantId: string }) {
  const supabase = createBrowserClient()
  const [posts, setPosts]           = useState<BlogPost[]>([])
  const [selected, setSelected]     = useState<BlogPost | null>(null)
  const [fullContent, setFullContent] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, image_url, author, published_at, tags')
      .eq('tenant_id', tenantId)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(12)
      .then(({ data }) => { if (data) setPosts(data) })
  }, [tenantId])

  const openPost = async (post: BlogPost) => {
    setSelected(post)
    const { data } = await supabase
      .from('blog_posts')
      .select('content')
      .eq('id', post.id)
      .single()
    if (data) setFullContent(data.content)
  }

  if (selected) {
    return (
      <section className="py-8 px-4 max-w-2xl mx-auto">
        <button onClick={() => { setSelected(null); setFullContent(null) }}
          className="text-sm text-gray-500 mb-6 flex items-center gap-1 hover:text-gray-800">
          ← Back to blogs
        </button>
        {selected.image_url && (
          <img src={selected.image_url} alt={selected.title}
            className="w-full h-56 object-cover rounded-2xl mb-6" />
        )}
        <h1 className="text-2xl font-bold text-gray-805 mb-2">{selected.title}</h1>
        <p className="text-xs text-gray-400 mb-6">
          By {selected.author} · {new Date(selected.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        {fullContent
          ? <div className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: fullContent }} />
          : <p className="text-gray-400 text-sm">Loading...</p>
        }
      </section>
    )
  }

  return (
    <section id="blogs" className="py-12 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-805 mb-8">From Our Blog</h2>
      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {posts.map(post => (
            <button key={post.id} onClick={() => openPost(post)}
              className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {post.image_url && (
                <img src={post.image_url} alt={post.title}
                  className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <p className="font-semibold text-gray-850 text-sm line-clamp-2 mb-1">{post.title}</p>
                <p className="text-xs text-gray-400 line-clamp-2">{post.excerpt}</p>
                <p className="text-xs text-gray-300 mt-2">
                  {new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
