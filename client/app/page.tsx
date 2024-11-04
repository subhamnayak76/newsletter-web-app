"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import dotenv from 'dotenv';
dotenv.config();


const HomePage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
 console.log(process.env.BACKEND_API)
  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Successfully subscribed to newsletter!' });
        setEmail('');
      } else {
        const data = await response.json() as { error?: string };
        setMessage({ type: 'error', text: data.error || 'Subscription failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error connecting to server' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="text-xl font-bold">Web Weekly</div>
        <div className="space-x-4">
          <a href="/features" className="hover:text-blue-600">Features</a>
          <a href="/pricing" className="hover:text-blue-600">Pricing</a>
          <a href="/about" className="hover:text-blue-600">About</a>
          <a href="/contact" className="hover:text-blue-600">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-6">Stay Informed with Our Newsletter</h1>
        <p className="text-gray-600 mb-8">
          Get the latest updates, news, and exclusive content delivered straight to your inbox.
        </p>
        <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
          <div className="flex gap-2">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="bg-black hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
          {message.text && (
            <Alert 
              className={`mt-4 ${
                message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
              }`}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Weekly Updates</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Stay up to date with the latest industry news and trends.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Exclusive Insights</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Get deep dives and analysis from industry experts.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Community Access</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Join discussions with like-minded professionals.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;