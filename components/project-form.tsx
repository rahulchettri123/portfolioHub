"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { X, AlertCircle } from "lucide-react"

type Project = {
  id: string
  title: string
  description: string
  techStack: string[]
  tags: string[]
  githubUrl: string
  demoUrl?: string
  url?: string
  date: string
  imageUrl: string
  imageLinkTo: string
}

export function ProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(projectId ? true : false)
  const [submitting, setSubmitting] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newTech, setNewTech] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [project, setProject] = useState<Project>({
    id: "",
    title: "",
    description: "",
    techStack: [],
    tags: [],
    githubUrl: "",
    demoUrl: "",
    url: "",
    date: new Date().toISOString().split("T")[0],
    imageUrl: "",
    imageLinkTo: "github",
  })

  // Add image upload functionality
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")

  useEffect(() => {
    if (projectId) {
      // Fetch the project data from the API
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch project');
          }
          const projectData = await response.json();
          
          // Format date for form input (YYYY-MM-DD)
          const date = new Date(projectData.date);
          const formattedDate = date.toISOString().split('T')[0];
          
          setProject({
            ...projectData,
            date: formattedDate
          });
          
          // If there's an existing image, set the preview
          if (projectData.imageUrl) {
            setImagePreview(projectData.imageUrl);
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          setErrorMessage("Error loading project data. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchProject();
    } else {
      setLoading(false);
    }
  }, [projectId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Reset any previous error messages when a new image is selected
      setErrorMessage(null)
      setUploadStatus("idle")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Upload image first if selected
      let imageUrl = project.imageUrl;
      
      if (selectedImage) {
        setUploadStatus("uploading");
        
        // Create FormData for the file upload
        const formData = new FormData();
        formData.append("file", selectedImage);
        
        // Upload image via our API
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || errorData.details || "Image upload failed");
        }
        
        const data = await uploadResponse.json();
        // Set the image URL directly from the response
        imageUrl = data.image.url;
        setUploadStatus("success");
      }

      // Prepare data for API
      const projectData = {
        ...project,
        imageUrl,
        date: new Date(project.date).toISOString()
      };

      // Determine if it's a create or update operation
      const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
      const method = projectId ? 'PUT' : 'POST';

      // Submit to API
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${projectId ? 'update' : 'create'} project`);
      }

      router.push("/admin");
    } catch (error) {
      console.error(`Error ${projectId ? 'updating' : 'creating'} project:`, error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProject((prev) => ({ ...prev, [name]: value }))
  }

  const addTag = () => {
    if (newTag && !project.tags.includes(newTag)) {
      setProject((prev) => ({ ...prev, tags: [...prev.tags, newTag] }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setProject((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const addTech = () => {
    if (newTech && !project.techStack.includes(newTech)) {
      setProject((prev) => ({ ...prev, techStack: [...prev.techStack, newTech] }))
      setNewTech("")
    }
  }

  const removeTech = (tech: string) => {
    setProject((prev) => ({ ...prev, techStack: prev.techStack.filter((t) => t !== tech) }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-10 bg-muted rounded w-full animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-32 bg-muted rounded w-full animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-10 bg-muted rounded w-full animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-6">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              value={project.title}
              onChange={handleChange}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={project.description}
              onChange={handleChange}
              placeholder="Describe your project"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              value={project.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demoUrl">Demo URL (Optional)</Label>
            <Input
              id="demoUrl"
              name="demoUrl"
              type="url"
              value={project.demoUrl}
              onChange={handleChange}
              placeholder="https://your-demo-url.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Project URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={project.url}
              onChange={handleChange}
              placeholder="https://your-project-url.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Completion Date</Label>
            <Input id="date" name="date" type="date" value={project.date} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Project Image</Label>
            <div className="space-y-4">
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-sm text-muted-foreground">
                Images are stored in AWS S3 and optimized for web display.
              </p>
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm mb-2">Preview:</p>
                  <div className="border rounded-md overflow-hidden w-full max-w-xs">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto" />
                  </div>
                </div>
              )}
              {uploadStatus === "uploading" && <p className="text-sm text-amber-600">Uploading image to S3...</p>}
              {uploadStatus === "success" && <p className="text-sm text-green-600">Upload successful!</p>}
              {uploadStatus === "error" && <p className="text-sm text-red-600">Upload failed. Please check AWS S3 permissions.</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageLinkTo">Link Image to</Label>
            <select
              id="imageLinkTo"
              name="imageLinkTo"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={project.imageLinkTo || "github"}
              onChange={handleChange}
            >
              <option value="github">GitHub</option>
              <option value="linkedin">LinkedIn</option>
              <option value="demo">Demo</option>
              <option value="none">No Link</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag (e.g., Deep Learning)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} disabled={!newTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="rounded-full hover:bg-muted p-0.5">
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag}</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack</Label>
            <div className="flex gap-2">
              <Input
                id="techStack"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="Add a technology (e.g., Python)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTech()
                  }
                }}
              />
              <Button type="button" onClick={addTech} disabled={!newTech}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="outline" className="flex items-center gap-1">
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)} className="rounded-full hover:bg-muted p-0.5">
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tech}</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : projectId ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

