'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  image: string | null
  author: string | null
  category: string | null
  tags: string | null
  isPublished: boolean
  isFeatured: boolean
  viewCount: number
  publishedAt: string | null
  createdAt: string
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    author: '',
    category: '',
    tags: '',
    isPublished: false,
    isFeatured: false
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog')
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/blog'
      const method = editingPost ? 'PUT' : 'POST'
      const body = editingPost ? { ...formData, id: editingPost.id } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast({ title: editingPost ? 'Post updated!' : 'Post created!' })
        setShowForm(false)
        setEditingPost(null)
        setFormData({
          title: '', content: '', excerpt: '', image: '',
          author: '', category: '', tags: '', isPublished: false, isFeatured: false
        })
        fetchPosts()
      }
    } catch (error) {
      toast({ title: 'Error saving post', variant: 'destructive' })
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      image: post.image || '',
      author: post.author || '',
      category: post.category || '',
      tags: post.tags || '',
      isPublished: post.isPublished,
      isFeatured: post.isFeatured
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      const res = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Post deleted!' })
        fetchPosts()
      }
    } catch (error) {
      toast({ title: 'Error deleting post', variant: 'destructive' })
    }
  }

  const togglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch('/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, isPublished: !post.isPublished })
      })
      if (res.ok) {
        toast({ title: post.isPublished ? 'Post unpublished!' : 'Post published!' })
        fetchPosts()
      }
    } catch (error) {
      toast({ title: 'Error updating post', variant: 'destructive' })
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500 mt-1">Manage your blog posts and articles</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingPost(null); }} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{editingPost ? 'Edit Post' : 'New Post'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <Textarea
                  placeholder="Content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  required
                />
                <Textarea
                  placeholder="Excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Image URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                  <Input
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="rounded"
                    />
                    Published
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded"
                    />
                    Featured
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                    {editingPost ? 'Update' : 'Create'} Post
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingPost(null); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Posts List */}
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {post.image && (
                  <img src={post.image} alt="" className="w-24 h-24 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <p className="text-sm text-gray-500">{post.excerpt || post.content.substring(0, 100)}...</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.isPublished ? 'default' : 'secondary'}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {post.isFeatured && <Badge variant="outline">Featured</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.author}</span>
                      <span>{post.category}</span>
                      <span>{post.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => togglePublish(post)}>
                        {post.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(post)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
