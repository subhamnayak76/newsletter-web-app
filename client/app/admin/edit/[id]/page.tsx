"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

const EditBlog = () => {
  const router = useRouter();
  const { id } = router.query;
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    author: '',
    tags: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`${API_URL}/blogs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blog');
      const data = await response.json() as { title: string; content: string; author: string; tags: string[] };
      setBlog({
        title: data.title,
        content: data.content,
        author: data.author,
        tags: data.tags.join(', ')
      });
    } catch (error) {
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...blog,
          tags: blog.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      if (!response.ok) throw new Error('Failed to update blog');

      router.push(`/blogs/${id}`);
    } catch (error) {
      setError('Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-800">Edit Blog Post</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={blog.title}
                onChange={e => setBlog({ ...blog, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Author</label>
              <Input
                value={blog.author}
                onChange={e => setBlog({ ...blog, author: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={blog.content}
                onChange={e => setBlog({ ...blog, content: e.target.value })}
                className="w-full min-h-[300px] p-3 border rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <Input
                value={blog.tags}
                onChange={e => setBlog({ ...blog, tags: e.target.value })}
                placeholder="Separate tags with commas"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/blogs/${id}`)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBlog;