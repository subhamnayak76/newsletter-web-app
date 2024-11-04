// app/blog/[id]/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import exp from 'constants';

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  publishDate: string;
  tags: string[];
}
export const runtime = 'edge'
export default function BlogDetail() {
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${process.env.BLOG_API}/${params.id}`);
        if (!response.ok) {
          throw new Error('Blog not found');
        }
        const data: Blog = await response.json();
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error || 'Blog not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <span>By {blog.author}</span>
            <span>•</span>
            <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            {blog.content}
          </div>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}