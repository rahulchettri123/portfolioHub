import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Code } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/date-utils";

export default async function BlogPage() {
  // Fetch all blogs
  const blogs = await prisma.blog.findMany({
    orderBy: [
      { eventDate: 'desc' }
    ]
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">Read about my projects, experiences, and lessons learned</p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog posts available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post) => (
            <Card key={post.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
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
              </CardHeader>
              
              {post.images && post.images.length > 0 && (
                <div className="px-6 pb-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                    <Image 
                      src={post.images[0]}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                      priority
                    />
                  </div>
                </div>
              )}
              
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">{post.description}</p>
                
                {post.skillsLearned && post.skillsLearned.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center text-sm font-medium mb-2">
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
              </CardContent>
              
              <CardFooter>
                <Link href={`/blog/${post.id}`}>
                  <Button variant="outline" size="sm">
                    Read more
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 