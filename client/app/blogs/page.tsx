"use client";

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const BlogList = () => {
  interface Blog {
    _id: string;
    title: string;
    author: string;
    content: string;
    tags: string[];
    publishDate: string;
  }

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/blogs`);
      if (response.ok) {
        const data: Blog[] = await response.json();
        setBlogs(data);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (error) {
      setError('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blogId: string) => {
    router.push(`/blog/${blogId}`);
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-6">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card
            key={blog._id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleBlogClick(blog._id)}
          >
            <CardHeader>
              <h2 className="text-xl font-bold">{blog.title}</h2>
              <p className="text-sm text-gray-500">
                By {blog.author} • {new Date(blog.publishDate).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {blog.content.substring(0, 150)}...
              </p>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
