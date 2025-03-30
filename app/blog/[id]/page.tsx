import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  MapPin, 
  Code, 
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/date-utils";

interface BlogPostPageProps {
  params: {
    id: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Fetch the blog post by ID
  const post = await prisma.blog.findUnique({
    where: {
      id: params.id
    }
  });

  // If post doesn't exist, return 404
  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
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
      </div>
      
      {/* Main content section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6">
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{post.description}</p>
            </div>
          </Card>
        </div>
        
        {/* Right column - Skills and Images */}
        <div className="space-y-6">
          {/* Skills Learned */}
          {post.skillsLearned && post.skillsLearned.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Skills Learned
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.skillsLearned.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
          
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Gallery</h3>
              <div className="space-y-4">
                {post.images.map((imgUrl: string, index: number) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-md border">
                    <Image 
                      src={imgUrl}
                      alt={`Image ${index + 1} for ${post.title}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 