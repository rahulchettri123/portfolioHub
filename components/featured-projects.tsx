"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Calendar, MapPin } from "lucide-react"

type Project = {
  id: string
  title: string
  description: string
  techStack: string[]
  tags: string[]
  githubUrl: string
  demoUrl?: string
  imageUrl?: string
  imageLinkTo?: string
  startDate?: string
  endDate?: string
  current?: boolean
  location?: string
  images?: string[]
  lessonsLearned?: string[]
}

export function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch projects from the API
    const fetchProjects = async () => {
      try {
        // Use the public API endpoint which doesn't require authentication
        const response = await fetch('/api/public/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        
        // Process the data to ensure all properties exist
        const processedData = data.map((project: Project) => ({
          ...project,
          // Handle array properties
          tags: Array.isArray(project.tags) ? project.tags : [],
          techStack: Array.isArray(project.techStack) ? project.techStack : [],
          images: Array.isArray(project.images) ? project.images : [],
          lessonsLearned: Array.isArray(project.lessonsLearned) ? project.lessonsLearned : [],
          
          // Ensure image-related properties exist
          imageUrl: project.imageUrl || (project.images && project.images.length > 0 ? project.images[0] : ""),
          imageLinkTo: project.imageLinkTo || "",
          demoUrl: project.demoUrl || "",
          
          // Ensure date properties are formatted
          startDate: project.startDate || "",
          endDate: project.endDate || "",
          current: Boolean(project.current),
          location: project.location || ""
        }));
        
        // Only take the 3 most recent projects for featured display
        const featuredProjects = processedData.slice(0, 3);
        setProjects(featuredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={`skeleton-card-${i}`} className="animate-pulse flex flex-col h-full">
            <CardHeader className="h-16 bg-muted/30 rounded-t-lg">
              <div className="h-5 bg-muted rounded w-2/3" />
            </CardHeader>
            <div className="px-6 pb-0">
              <div className="aspect-video w-full bg-muted rounded-md mb-4" />
            </div>
            <CardContent className="flex-grow">
              <div className="h-4 bg-muted rounded mb-4 w-full" />
              <div className="h-4 bg-muted rounded mb-4 w-full" />
              <div className="h-4 bg-muted rounded mb-4 w-3/4" />
              
              {/* Skeleton for dates/location */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded w-32" />
              </div>
              
              {/* Skeleton for tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-14" />
              </div>
              
              {/* Skeleton for tech stack */}
              <div className="flex flex-wrap gap-1">
                <div className="h-3 bg-muted rounded w-12" />
                <div className="h-3 bg-muted rounded w-14" />
                <div className="h-3 bg-muted rounded w-10" />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="h-8 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          {(project.imageUrl || (project.images && project.images.length > 0)) && (
            <div className="px-6 pb-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                <Link 
                  href={
                    project.imageLinkTo === "github" 
                      ? project.githubUrl 
                      : project.imageLinkTo === "linkedin" 
                        ? "https://linkedin.com/in/rahulchettri123" 
                        : project.demoUrl || "#"
                  }
                  target="_blank" 
                  className="block w-full h-full"
                >
                  <img 
                    src={project.imageUrl || (project.images && project.images[0])}
                    alt={project.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ExternalLink className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
                  </div>
                </Link>
              </div>
            </div>
          )}
          <CardContent className="flex-grow">
            <p className="text-muted-foreground mb-4">{project.description}</p>
            
            {/* Display project dates and location if available */}
            {(project.startDate || project.location) && (
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                {project.startDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {project.startDate && new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                      {project.current && " - Present"}
                    </span>
                  </div>
                )}
                
                {project.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{project.location}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Display tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(project.tags || []).map((tag, index) => (
                <Badge key={`${project.id}-tag-${index}-${tag}`} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Display lessons learned if available */}
            {project.lessonsLearned && project.lessonsLearned.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.lessonsLearned.map((lesson, index) => (
                  <Badge key={`${project.id}-lesson-${index}`} variant="secondary">
                    {lesson}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
              {(project.techStack || []).map((tech, index) => (
                <span key={`${project.id}-tech-${index}-${tech}`} className="after:content-[','] last:after:content-[''] after:mr-1">
                  {tech}
                </span>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {project.githubUrl ? (
              <Link href={project.githubUrl} target="_blank">
                <Button variant="outline" size="sm">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </Link>
            ) : (
              <span></span>
            )}
            <Link href={`/projects/${project.id || ""}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

