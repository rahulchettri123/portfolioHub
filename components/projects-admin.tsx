"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, ExternalLink } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

type Project = {
  id: string
  title: string
  description: string
  techStack: string[]
  tags: string[]
  githubUrl: string
  demoUrl?: string
  date: string
  imageUrl?: string
  imageLinkTo?: string
}

export function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects();
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Update the UI by removing the deleted project
      setProjects(projects.filter((project) => project.id !== id));
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add New Project
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col h-full animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="h-6 bg-muted rounded w-2/3" />
                <div className="flex gap-2 shrink-0">
                  <div className="h-8 w-8 bg-muted rounded" />
                  <div className="h-8 w-8 bg-muted rounded" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <div className="h-32 bg-muted rounded" />
                <div className="h-4 bg-muted rounded mb-2 w-full" />
                <div className="h-4 bg-muted rounded mb-2 w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
                <div className="flex justify-between mt-auto pt-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
        <Link href="/admin/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Project
          </Button>
        </Link>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">Add your first project to get started</p>
          <Link href="/admin/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/admin/edit/${project.id}`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </Link>
                  <AlertDialog
                    open={projectToDelete === project.id}
                    onOpenChange={(open) => !open && setProjectToDelete(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setProjectToDelete(project.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the project "{project.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProject(project.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                {project.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                    <div className="w-full h-full relative">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="object-cover w-full h-full"
                      />
                      {project.imageLinkTo && project.imageLinkTo !== "none" && (
                        <div className="absolute bottom-2 right-2">
                          <Link 
                            href={
                              project.imageLinkTo === "github" 
                                ? project.githubUrl 
                                : project.imageLinkTo === "linkedin" 
                                  ? "https://linkedin.com/in/rahulchettri123" 
                                  : project.demoUrl || "#"
                            }
                            target="_blank"
                            className="bg-background/80 p-2 rounded-full backdrop-blur-sm hover:bg-background/90 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View on {project.imageLinkTo}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline">+{project.tags.length - 3}</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center mt-auto pt-2">
                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground max-w-[70%]">
                    {project.techStack.slice(0, 3).join(", ")}
                    {project.techStack.length > 3 && (
                      <span>+{project.techStack.length - 3} more</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(project.date).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

