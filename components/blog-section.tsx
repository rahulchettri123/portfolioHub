"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  PenTool, 
  Code
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Define type for blog post data
interface BlogPost {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  eventDate: string | Date;
  skillsLearned: string[];
  images: string[];
}

export function BlogSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  // Track image loading errors
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const response = await fetch('/api/blog');
        if (response.ok) {
          const data = await response.json();
          
          // Debug logging
          console.log("Fetched blog posts:", data);
          let debugMessages: string[] = [];
          
          // Log each image URL for debugging
          data.forEach((post: BlogPost) => {
            console.log(`Blog post '${post.title}' images:`, post.images);
            if (post.images && post.images.length > 0) {
              post.images.forEach((img, i) => {
                const msg = `Post '${post.title}' image ${i}: ${img}`;
                console.log(msg);
                debugMessages.push(msg);
              });
            } else {
              const msg = `Post '${post.title}' has no images`;
              console.log(msg);
              debugMessages.push(msg);
            }
          });
          
          setDebugInfo(debugMessages);
          setBlogPosts(data);
        } else {
          console.error('Failed to fetch blog posts');
          setDebugInfo(['Failed to fetch blog posts']);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setDebugInfo([`Error fetching blog posts: ${error}`]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlogPosts();
  }, []);

  // Format date for display (Month Day, Year)
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper function to determine if a URL is external (S3 or other domain)
  const isExternalUrl = (url: string) => {
    if (!url) return false;
    return url.startsWith('http') || 
           url.startsWith('https') || 
           url.includes('amazonaws.com');
  };
  
  // Helper function to determine if a URL is a local file
  const isLocalFile = (url: string) => {
    if (!url) return false;
    return url.startsWith('/uploads/');
  };

  // Handle image error
  const handleImageError = (imgUrl: string) => {
    console.error(`Failed to load image: ${imgUrl}`);
    setImageErrors(prev => ({
      ...prev,
      [imgUrl]: true
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading blog posts...</p>
      </div>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <div className="space-y-4">
        <p>No blog posts found.</p>
        {debugInfo.length > 0 && (
          <div className="p-4 border rounded bg-gray-100 text-xs font-mono">
            <h4 className="font-bold">Debug Info:</h4>
            <ul>
              {debugInfo.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {blogPosts.map((post) => (
        <div key={post.id} className="flex flex-col gap-6 border-b pb-10">
          <h3 className="text-2xl font-bold">{post.title}</h3>
          
          {/* Date and Location */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(post.eventDate)}</span>
            </div>
            
            {post.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{post.location}</span>
              </div>
            )}
          </div>
          
          {/* Skills Learned */}
          {post.skillsLearned && post.skillsLearned.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-sm font-medium">
                <Code className="h-4 w-4 mr-1" />
                <span>Skills Learned</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.skillsLearned.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Description - with max width and proper formatting */}
          <div className="max-w-prose">
            <p className="text-base leading-relaxed whitespace-pre-line">{post.description}</p>
          </div>
          
          {/* Image Collage - improved version with better sizing and display */}
          {post.images && post.images.length > 0 ? (
            <div className={`grid gap-4 ${
              post.images.length === 1 ? 'grid-cols-1 max-w-2xl' : 
              post.images.length === 2 ? 'grid-cols-2 max-w-3xl' :
              'grid-cols-2 md:grid-cols-4'
            }`}>
              {post.images.map((imgUrl, index) => (
                <div 
                  key={index} 
                  className={`relative overflow-hidden rounded-md border ${
                    post.images.length >= 3 && index === 0 ? 'col-span-2 row-span-2' : 
                    post.images.length === 4 && index === 3 ? 'col-span-2' : ''
                  }`}
                  style={{ 
                    height: post.images.length === 1 ? '400px' : 
                            post.images.length === 2 ? '300px' : 
                            '200px',
                    minHeight: '200px'
                  }}
                >
                  {imageErrors[imgUrl] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Image 
                        src="/placeholder.jpg"
                        alt="Placeholder image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : isExternalUrl(imgUrl) ? (
                    // For external S3 URLs, use img tag with error handling
                    <img 
                      src={imgUrl} 
                      alt={`Image for ${post.title}`} 
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(imgUrl)}
                    />
                  ) : (
                    // For local URLs, use Next.js Image
                    <Image 
                      src={imgUrl}
                      alt={`Image for ${post.title}`}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={() => handleImageError(imgUrl)}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded text-center">
              <p className="text-gray-500">No images available for this post</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 