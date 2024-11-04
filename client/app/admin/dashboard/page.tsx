"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const CreateBlog = () => {
  const router = useRouter();
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    author: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...blog,
          tags: blog.tags.split(',').map(tag => tag.trim())
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create blog');
      }

      router.push('/blogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Title</label>
              <Input
                required
                value={blog.title}
                onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <label className="block mb-2">Content</label>
              <Textarea
                required
                value={blog.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBlog({ ...blog, content: e.target.value })}
                placeholder="Write your blog content..."
                className="min-h-[200px]"
              />
            </div>

            <div>
              <label className="block mb-2">Author</label>
              <Input
                required
                value={blog.author}
                onChange={(e) => setBlog({ ...blog, author: e.target.value })}
                placeholder="Enter author name"
              />
            </div>

            <div>
              <label className="block mb-2">Tags (comma-separated)</label>
              <Input
                value={blog.tags}
                onChange={(e) => setBlog({ ...blog, tags: e.target.value })}
                placeholder="tech, programming, web..."
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Blog Post'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBlog;