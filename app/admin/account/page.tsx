"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Lock, Plus, Trash, Briefcase, PenTool, GraduationCap, Pencil, Trash2, X } from "lucide-react"
import { getSession } from "next-auth/react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

type UserProfile = {
  id: string
  name: string
  email: string
  bio: string
  title: string
  location: string
  socialLinks: {
    github: string
    linkedin: string
    twitter: string
    website: string
  }
  profileImageUrl: string
}

// Define Education type
type Education = {
  id?: string
  universityName: string
  location: string
  degree: string
  startDate: string
  endDate: string | null
  gpa: string | null
  logoImageUrl?: string | null
  courses: string[]
  order?: number
}

// Define Experience type
type Experience = {
  id?: string
  jobTitle: string
  company: string
  location: string
  description: string
  startDate: string
  endDate: string | null
  current: boolean
  companyLogo?: string | null
  order?: number
}

// Define Blog type
type Blog = {
  id?: string
  title: string
  description: string
  location: string
  eventDate: string
  skillsLearned: string[]
  images: string[]
  url?: string // Add URL field for blog links
  githubUrl?: string
  linkedinUrl?: string
}

// Define Project type
type Project = {
  id?: string
  title: string
  description: string
  location: string
  startDate: string
  endDate: string | null
  current: boolean
  images: string[]
  lessonsLearned: string[]
  techStack?: string[]
  tags?: string[]
  url?: string
  githubUrl?: string
}

export default function AccountPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    bio: "",
    title: "",
    location: "",
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      website: ""
    },
    profileImageUrl: ""
  })
  
  // Experience state
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true)
  const [experienceForm, setExperienceForm] = useState<Experience>({
    jobTitle: "",
    company: "",
    location: "",
    description: "",
    startDate: "",
    endDate: null,
    current: false,
    companyLogo: null,
    order: 0
  })
  const [experienceError, setExperienceError] = useState<string | null>(null)
  const [experienceSuccess, setExperienceSuccess] = useState<string | null>(null)
  const [isSubmittingExperience, setIsSubmittingExperience] = useState(false)
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const companyLogoInputRef = useRef<HTMLInputElement>(null)
  
  // Security settings state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    newEmail: ""
  })
  const [securityErrorMessage, setSecurityErrorMessage] = useState<string | null>(null)
  const [securitySuccessMessage, setSecuritySuccessMessage] = useState<string | null>(null)
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false)
  
  // Image upload state
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Add new state to track which experience is being deleted
  const [deletingExperienceId, setDeletingExperienceId] = useState<string | null>(null)
  
  // Blog state
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true)
  const [blogForm, setBlogForm] = useState<Blog>({
    id: undefined,
    title: '',
    description: '',
    location: '',
    eventDate: new Date().toISOString().split('T')[0],
    skillsLearned: [],
    images: [],
    url: '', // Initialize URL field
    githubUrl: '',
    linkedinUrl: '',
  });
  const [blogError, setBlogError] = useState<string | null>(null)
  const [blogSuccess, setBlogSuccess] = useState<string | null>(null)
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState("")
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const blogImageInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingBlogImage, setIsUploadingBlogImage] = useState(false)
  
  // Education state
  const [educations, setEducations] = useState<Education[]>([])
  const [isLoadingEducations, setIsLoadingEducations] = useState(true)
  const [educationForm, setEducationForm] = useState<Education>({
    universityName: "",
    location: "",
    degree: "",
    startDate: "",
    endDate: null,
    gpa: null,
    logoImageUrl: null,
    courses: [], // Make sure courses is an empty array
    order: 0
  })
  const [courseInput, setCourseInput] = useState("")
  const [educationError, setEducationError] = useState<string | null>(null)
  const [educationSuccess, setEducationSuccess] = useState<string | null>(null)
  const [isSubmittingEducation, setIsSubmittingEducation] = useState(false)
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null)
  const [universityLogoPreview, setUniversityLogoPreview] = useState<string | null>(null)
  const [isUploadingUniversityLogo, setIsUploadingUniversityLogo] = useState(false)
  const universityLogoInputRef = useRef<HTMLInputElement>(null)
  
  // Project state
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [projectForm, setProjectForm] = useState<Project>({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: null,
    current: false,
    images: [],
    lessonsLearned: [],
    techStack: [],
    tags: [],
    url: "",
    githubUrl: ""
  })
  const [projectError, setProjectError] = useState<string | null>(null)
  const [projectSuccess, setProjectSuccess] = useState<string | null>(null)
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [techInput, setTechInput] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [projectImagePreview, setProjectImagePreview] = useState<string | null>(null)
  const [isUploadingProjectImage, setIsUploadingProjectImage] = useState(false)
  const projectImageInputRef = useRef<HTMLInputElement>(null)
  const [projectImagePreviewUrls, setProjectImagePreviewUrls] = useState<string[]>([])
  const [lessonInput, setLessonInput] = useState("")
  
  // Fetch the user profile data when the component mounts
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true)
        
        // First check if user is logged in
        const session = await getSession()
        if (!session) {
          router.push('/login')
          return
        }
        
        const response = await fetch('/api/admin/account')
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        
        const data = await response.json()
        console.log("🔍 DEBUG - Fetched profile data:", JSON.stringify(data, null, 2))
        
        // Only update the state if we have valid data
        if (data && data.email) {
          // Ensure we have a complete profile object with all fields
          const completeProfile = {
            id: data.id || "",
            name: data.name || "",
            email: data.email || "",
            bio: data.bio || "",
            title: data.title || "",
            location: data.location || "",
            socialLinks: {
              github: data.socialLinks?.github || "",
              linkedin: data.socialLinks?.linkedin || "",
              twitter: data.socialLinks?.twitter || "",
              website: data.socialLinks?.website || ""
            },
            profileImageUrl: data.profileImageUrl || ""
          };
          
          console.log("🔍 Setting profile state to:", JSON.stringify(completeProfile, null, 2));
          setProfile(completeProfile);
          
          // Update security email field
          setSecurityData(prev => ({
            ...prev,
            newEmail: data.email
          }));
          
          // If there's a profile image, set the preview
          if (data.profileImageUrl) {
            console.log("🔍 Setting image preview to:", data.profileImageUrl);
            setImagePreview(data.profileImageUrl);
          }
        } else {
          console.error("Invalid profile data received:", data);
          throw new Error('Invalid profile data received');
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setErrorMessage('Failed to load profile information. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfile()
  }, [router])
  
  // Fetch experiences data
  useEffect(() => {
    async function fetchExperiences() {
      try {
        setIsLoadingExperiences(true)
        const response = await fetch('/api/experience')
        
        if (!response.ok) {
          throw new Error('Failed to fetch experiences')
        }
        
        const data = await response.json()
        // Filter out default experiences by checking if id starts with "default-"
        const actualExperiences = data.filter((exp: Experience) => 
          exp.id && !exp.id.toString().startsWith('default-')
        )
        
        setExperiences(actualExperiences)
      } catch (error) {
        console.error('Error fetching experiences:', error)
      } finally {
        setIsLoadingExperiences(false)
      }
    }
    
    fetchExperiences()
  }, [])
  
  // Fetch blogs data
  useEffect(() => {
    async function fetchBlogs() {
      try {
        setIsLoadingBlogs(true)
        const response = await fetch('/api/blog')
        
        if (!response.ok) {
          throw new Error('Failed to fetch blogs')
        }
        
        const data = await response.json()
        console.log("Fetched blog posts:", data)
        
        // Log image URLs to debug
        data.forEach((blog: Blog) => {
          console.log(`Blog post '${blog.title}' has ${blog.images?.length || 0} images:`, blog.images || [])
        })
        
        // Ensure the images array is present and valid for each blog post
        const processedData = data.map((blog: Blog) => ({
          ...blog,
          images: Array.isArray(blog.images) ? blog.images : []
        }))
        
        setBlogs(processedData)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setIsLoadingBlogs(false)
      }
    }
    
    fetchBlogs()
  }, [])
  
  // Fetch education data
  useEffect(() => {
    async function fetchEducations() {
      try {
        setIsLoadingEducations(true)
        const response = await fetch('/api/education')
        
        if (!response.ok) {
          throw new Error('Failed to fetch education entries')
        }
        
        const data = await response.json()
        // Filter out default education entries by checking if id starts with "default-"
        const actualEducations = data.filter((edu: Education) => 
          edu.id && !edu.id.toString().startsWith('default-')
        )
        
        setEducations(actualEducations)
      } catch (error) {
        console.error('Error fetching education:', error)
      } finally {
        setIsLoadingEducations(false)
      }
    }
    
    fetchEducations()
  }, [])
  
  // Fetch projects data
  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoadingProjects(true)
        const response = await fetch('/api/projects')
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setIsLoadingProjects(false)
      }
    }
    
    fetchProjects()
  }, [])
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: 'main' | 'social',
    field: string
  ) => {
    if (section === 'main') {
      setProfile(prev => ({
        ...prev,
        [field]: e.target.value
      }))
    } else if (section === 'social') {
      setProfile(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: e.target.value
        }
      }))
    }
  }
  
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSecurityData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file.')
      return
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const handleImageUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setErrorMessage('Please select an image to upload.')
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/account/profile-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload image")
      }

      const data = await response.json()
      console.log("Image upload response:", data)
      
      // Update profile with the new image URL
      setProfile(prev => ({
        ...prev,
        profileImageUrl: data.imageUrl
      }))
      
      setSuccessMessage("Profile image uploaded successfully!")
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    
    try {
      console.log("Submitting profile update:", profile)
      
      const response = await fetch('/api/admin/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }
      
      // Update the profile state with the response data
      const updatedProfile = await response.json()
      console.log("Profile updated successfully:", updatedProfile)
      
      setProfile(updatedProfile)
      
      setSuccessMessage("Profile updated successfully!")
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityErrorMessage(null)
    setSecuritySuccessMessage(null)
    setIsSecuritySubmitting(true)
    
    // Validation
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      setSecurityErrorMessage("New password and confirmation do not match.")
      setIsSecuritySubmitting(false)
      return
    }
    
    if (!securityData.currentPassword) {
      setSecurityErrorMessage("Current password is required.")
      setIsSecuritySubmitting(false)
      return
    }
    
    if (!securityData.newPassword && !securityData.newEmail) {
      setSecurityErrorMessage("Please provide a new password or email to update.")
      setIsSecuritySubmitting(false)
      return
    }
    
    // Only include the email if it's different from the current one
    const payload = {
      currentPassword: securityData.currentPassword,
      newPassword: securityData.newPassword || undefined,
      newEmail: securityData.newEmail !== profile.email ? securityData.newEmail : undefined
    }
    
    try {
      console.log("Submitting security update")
      
      const response = await fetch('/api/admin/account/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update security settings")
      }
      
      const data = await response.json()
      console.log("Security settings updated:", data)
      
      // If email was updated, update the profile
      if (data.email !== profile.email) {
        setProfile(prev => ({
          ...prev,
          email: data.email
        }))
      }
      
      setSecuritySuccessMessage("Security settings updated successfully!")
      
      // Clear password fields
      setSecurityData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }))
      
    } catch (error) {
      console.error('Error updating security settings:', error)
      setSecurityErrorMessage(error instanceof Error ? error.message : "Failed to update security settings")
    } finally {
      setIsSecuritySubmitting(false)
    }
  }
  
  // Handle experience form input changes
  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setExperienceForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle current checkbox toggle
  const handleCurrentToggle = (checked: boolean) => {
    setExperienceForm(prev => ({
      ...prev,
      current: checked,
      endDate: checked ? null : prev.endDate
    }))
  }
  
  // Reset experience form
  const resetExperienceForm = () => {
    setExperienceForm({
      jobTitle: "",
      company: "",
      location: "",
      description: "",
      startDate: "",
      endDate: null,
      current: false,
      companyLogo: null,
      order: 0
    })
    setEditingExperienceId(null)
    setCompanyLogoPreview(null)
  }
  
  // Edit experience
  const handleEditExperience = (experience: Experience) => {
    // Format dates for form input
    const formattedStartDate = new Date(experience.startDate).toISOString().split('T')[0]
    const formattedEndDate = experience.endDate 
      ? new Date(experience.endDate).toISOString().split('T')[0]
      : null
    
    setExperienceForm({
      ...experience,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    })
    
    // Set company logo preview if exists
    if (experience.companyLogo) {
      setCompanyLogoPreview(experience.companyLogo)
    } else {
      setCompanyLogoPreview(null)
    }
    
    setEditingExperienceId(experience.id)
  }
  
  // Handle company logo change
  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setExperienceError('Please select an image file for the company logo.')
      return
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setCompanyLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  // Upload company logo
  const handleCompanyLogoUpload = async () => {
    const file = companyLogoInputRef.current?.files?.[0]
    if (!file) {
      setExperienceError('Please select an image to upload.')
      return
    }

    setIsUploadingLogo(true)
    setExperienceError(null)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "company-logo") // Specify this is a company logo

      const response = await fetch("/api/admin/account/profile-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload company logo")
      }

      const data = await response.json()
      console.log("Company logo upload response:", data)
      
      // Update experience form with the new logo URL
      setExperienceForm(prev => ({
        ...prev,
        companyLogo: data.imageUrl
      }))
      
      setExperienceSuccess("Company logo uploaded successfully!")
      
      // Clear the file input
      if (companyLogoInputRef.current) {
        companyLogoInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading company logo:", error)
      setExperienceError(error instanceof Error ? error.message : "Failed to upload company logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }
  
  // Update the delete experience function to track which item is being deleted
  const handleDeleteExperience = async (id: string) => {
    if (!id) {
      setExperienceError("Invalid experience ID");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this experience? This action cannot be undone.")) {
      return;
    }
    
    setIsSubmittingExperience(true);
    setExperienceError(null);
    setExperienceSuccess(null);
    setDeletingExperienceId(id);
    
    try {
      console.log(`Deleting experience with ID: ${id}`);
      
      const response = await fetch(`/api/experience/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errorData.error || `Failed to delete experience (Status: ${response.status})`);
      }
      
      // Remove from state
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setExperienceSuccess("Experience deleted successfully");
      
      // Clear form if we were editing this experience
      if (editingExperienceId === id) {
        resetExperienceForm();
      }
      
    } catch (error) {
      console.error('Error deleting experience:', error);
      setExperienceError(error instanceof Error ? error.message : "Failed to delete experience");
    } finally {
      setIsSubmittingExperience(false);
      setDeletingExperienceId(null);
    }
  };
  
  // Submit experience form
  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setExperienceError(null)
    setExperienceSuccess(null)
    setIsSubmittingExperience(true)
    
    // Validate required fields
    if (!experienceForm.jobTitle || !experienceForm.company || !experienceForm.startDate) {
      setExperienceError("Job title, company, and start date are required")
      setIsSubmittingExperience(false)
      return
    }
    
    // Validate dates
    if (!experienceForm.current && !experienceForm.endDate) {
      setExperienceError("End date is required if not current position")
      setIsSubmittingExperience(false)
      return
    }
    
    try {
      // Check if there's a new logo file to upload
      const logoFile = companyLogoInputRef.current?.files?.[0]
      let logoUrl = experienceForm.companyLogo
      
      // If there's a file and it's different from what we already have
      if (logoFile && companyLogoPreview && companyLogoPreview.startsWith('data:')) {
        // Upload the logo first
        const formData = new FormData()
        formData.append("file", logoFile)
        formData.append("type", "company-logo")
        
        const uploadResponse = await fetch("/api/admin/account/profile-image", {
          method: "POST",
          body: formData,
        })
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "Failed to upload company logo")
        }
        
        const uploadData = await uploadResponse.json()
        console.log("Company logo uploaded:", uploadData)
        logoUrl = uploadData.imageUrl
      }
      
      // Prepare the experience data with the logo URL
      const formData = {
        ...experienceForm,
        companyLogo: logoUrl
      }
      
      const method = editingExperienceId ? 'PUT' : 'POST'
      const url = editingExperienceId 
        ? `/api/experience/${editingExperienceId}` 
        : '/api/experience'
      
      console.log("Submitting experience:", formData)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `Failed to ${editingExperienceId ? 'update' : 'add'} experience`)
      }
      
      const savedExperience = await response.json()
      
      if (editingExperienceId) {
        // Update existing experience in state
        setExperiences(prev => 
          prev.map(exp => exp.id === editingExperienceId ? savedExperience : exp)
        )
        setExperienceSuccess("Experience updated successfully")
      } else {
        // Add new experience to state
        setExperiences(prev => [...prev, savedExperience])
        setExperienceSuccess("Experience added successfully")
      }
      
      // Reset form
      resetExperienceForm()
      
    } catch (error) {
      console.error('Error saving experience:', error)
      setExperienceError(error instanceof Error ? error.message : "Failed to save experience")
    } finally {
      setIsSubmittingExperience(false)
    }
  }
  
  // Reset blog form
  const resetBlogForm = () => {
    setBlogForm({
      id: undefined,
      title: '',
      description: '',
      location: '',
      eventDate: new Date().toISOString().split('T')[0],
      skillsLearned: [],
      images: [],
      url: '', // Initialize URL field
      githubUrl: '',
      linkedinUrl: '',
    });
    setEditingBlogId(null);
    setImagePreviewUrls([]);
    if (blogImageInputRef.current) {
      blogImageInputRef.current.value = '';
    }
  };
  
  // Handle blog form input changes
  const handleBlogChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBlogForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Add skill to the skills list
  const handleAddSkill = () => {
    if (skillInput.trim() !== "") {
      setBlogForm(prev => ({
        ...prev,
        skillsLearned: [...prev.skillsLearned, skillInput.trim()]
      }))
      setSkillInput("")
    }
  }
  
  // Remove skill from the skills list
  const handleRemoveSkill = (indexToRemove: number) => {
    setBlogForm(prev => ({
      ...prev,
      skillsLearned: prev.skillsLearned.filter((_, index) => index !== indexToRemove)
    }))
  }
  
  // Handle blog image change
  const handleBlogImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    // Limit to 4 images
    const remainingSlots = 4 - imagePreviewUrls.filter(url => !url.startsWith('data:')).length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)
    
    filesToProcess.forEach(file => {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        setBlogError('Please select image files only.')
        return
      }
      
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }
  
  // Upload blog image
  const handleBlogImageUpload = async () => {
    const fileInput = blogImageInputRef.current
    if (!fileInput || fileInput.files.length === 0) {
      setBlogError('Please select at least one image to upload.')
      return null;
    }
    
    setIsUploadingBlogImage(true)
    setBlogError(null)
    
    const newImageUrls: string[] = [...blogForm.images]
    console.log("Starting image upload with existing images:", newImageUrls);
    
    try {
      for (let i = 0; i < Math.min(fileInput.files.length, 4 - blogForm.images.length); i++) {
        const file = fileInput.files[i]
        console.log(`Uploading file ${i+1}/${fileInput.files.length}: ${file.name} (${file.type}, ${file.size} bytes)`);
        
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", "blog-image")
        
        const response = await fetch("/api/admin/account/profile-image", {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to upload image")
        }
        
        const data = await response.json()
        console.log("Blog image upload response:", data)
        
        // Ensure the imageUrl is valid
        if (!data.imageUrl) {
          console.error("No imageUrl returned from upload")
          continue
        }
        
        // Log the detected URL type
        const isS3Url = data.imageUrl.includes('amazonaws.com') || data.imageUrl.startsWith('https://');
        console.log(`Image URL type: ${isS3Url ? 'S3/External' : 'Local'}, URL: ${data.imageUrl}`);
        
        // Verify the image URL is accessible
        try {
          const verifyResponse = await fetch('/api/check-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl: data.imageUrl })
          });
          const verifyData = await verifyResponse.json();
          console.log("Image URL verification:", verifyData);
        } catch (verifyError) {
          console.error("Failed to verify image URL:", verifyError);
        }
        
        newImageUrls.push(data.imageUrl)
      }
      
      console.log("After uploads, new image URLs:", newImageUrls);
      
      // Update blog form with the new image URLs
      setBlogForm(prev => {
        const updatedForm = {
          ...prev,
          images: newImageUrls
        };
        console.log("Updated blog form:", updatedForm);
        return updatedForm;
      })
      
      console.log("Final blog form images:", newImageUrls);
      setBlogSuccess("Images uploaded successfully!")
      
      // Clear the file input and preview
      if (blogImageInputRef.current) {
        blogImageInputRef.current.value = ""
      }
      setImagePreviewUrls([])
      
      return newImageUrls; // Return the updated image URLs for use in the submit function
    } catch (error) {
      console.error("Error uploading images:", error)
      setBlogError(error instanceof Error ? error.message : "Failed to upload images")
      return null; // Return null if there was an error
    } finally {
      setIsUploadingBlogImage(false)
    }
  }
  
  // Remove image from the blog form
  const handleRemoveImage = (indexToRemove: number) => {
    setBlogForm(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }))
  }
  
  // Edit blog
  const handleEditBlog = (blog: Blog) => {
    // Format date for form input
    let formattedEventDate = "";
    try {
      const date = new Date(blog.eventDate);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        formattedEventDate = date.toISOString().split('T')[0];
      } else {
        console.error("Invalid date format in blog.eventDate:", blog.eventDate);
        formattedEventDate = new Date().toISOString().split('T')[0]; // Fallback to current date
      }
    } catch (error) {
      console.error("Error formatting blog eventDate:", error);
      formattedEventDate = new Date().toISOString().split('T')[0]; // Fallback to current date
    }
    
    console.log("Editing blog post:", blog)
    console.log("Blog images:", blog.images)
    console.log("Formatted event date:", formattedEventDate)
    
    // Make sure we have a valid images array
    const validImages = blog.images && Array.isArray(blog.images) 
      ? blog.images.filter(url => 
          url && (url.startsWith('http') || url.startsWith('https') || url.startsWith('/uploads/'))
        )
      : [];
    
    setBlogForm({
      ...blog,
      eventDate: formattedEventDate,
      images: validImages // Ensure we set valid images
    })
    
    setEditingBlogId(blog.id)
    
    // Set image previews from existing images
    setImagePreviewUrls(validImages)
    
    // Log what we're setting
    console.log("Setting blog form with images:", validImages)
  }
  
  // Delete blog
  const handleDeleteBlog = async (id: string) => {
    if (!id) {
      setBlogError("Invalid blog ID")
      return
    }
    
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      return
    }
    
    setIsSubmittingBlog(true)
    setBlogError(null)
    setBlogSuccess(null)
    setDeletingBlogId(id)
    
    try {
      console.log(`Deleting blog with ID: ${id}`)
      
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `Failed to delete blog post (Status: ${response.status})`)
      }
      
      // Remove from state
      setBlogs(prev => prev.filter(blog => blog.id !== id))
      setBlogSuccess("Blog post deleted successfully")
      
      // Clear form if we were editing this blog
      if (editingBlogId === id) {
        resetBlogForm()
      }
      
    } catch (error) {
      console.error('Error deleting blog post:', error)
      setBlogError(error instanceof Error ? error.message : "Failed to delete blog post")
    } finally {
      setIsSubmittingBlog(false)
      setDeletingBlogId(null)
    }
  }
  
  // Submit blog form
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBlogError(null)
    setBlogSuccess(null)
    setIsSubmittingBlog(true)
    
    // Validate required fields
    if (!blogForm.title || !blogForm.description || !blogForm.eventDate) {
      setBlogError("Title, description, and event date are required")
      setIsSubmittingBlog(false)
      return
    }
    
    // Validate event date format
    let formattedEventDate;
    try {
      const date = new Date(blogForm.eventDate);
      if (isNaN(date.getTime())) {
        setBlogError("Invalid event date format");
        setIsSubmittingBlog(false);
        return;
      }
      formattedEventDate = date.toISOString();
    } catch (error) {
      console.error("Error formatting event date:", error);
      setBlogError("Invalid event date format");
      setIsSubmittingBlog(false);
      return;
    }
    
    // We'll now accept any URL input and try to fix it on the server side
    
    try {
      // No URL validation - accept all URLs as-is
      
      let finalImages = [...blogForm.images];
      
      // First, make sure all images are uploaded and we have their URLs
      if (imagePreviewUrls.some(url => url.startsWith('data:'))) {
        const uploadedImages = await handleBlogImageUpload();
        if (uploadedImages) {
          finalImages = uploadedImages;
        }
      }
      
      // Make a copy of the final form data with all uploaded images
      const finalBlogData = {
        ...blogForm,
        // Ensure eventDate is properly formatted
        eventDate: formattedEventDate,
        // Use URLs as-is without validation or formatting
        url: blogForm.url,
        githubUrl: blogForm.githubUrl,
        linkedinUrl: blogForm.linkedinUrl,
        // Ensure images array is properly formed and contains all uploaded images
        images: finalImages.filter(url => url && (url.startsWith('http') || url.startsWith('/uploads/')))
      }
      
      console.log("Submitting blog post with images:", finalBlogData.images)
      console.log("Event date being submitted:", finalBlogData.eventDate)
      console.log("URLs being submitted:", {
        original: {
          url: blogForm.url || '',
          githubUrl: blogForm.githubUrl || '',
          linkedinUrl: blogForm.linkedinUrl || ''
        },
        formatted: {
          url: finalBlogData.url,
          githubUrl: finalBlogData.githubUrl,
          linkedinUrl: finalBlogData.linkedinUrl
        }
      })
      
      const method = editingBlogId ? 'PUT' : 'POST'
      const url = editingBlogId 
        ? `/api/blog/${editingBlogId}` 
        : '/api/blog'
      
      console.log(`Submitting blog to ${url} with method ${method}`)
      
      // Add better error handling with try/catch for network errors
      let response;
      try {
        response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(finalBlogData)
        });
        console.log(`Response status: ${response.status}, statusText: ${response.statusText}`)
      } catch (networkError) {
        console.error('Network error during blog submission:', networkError);
        throw new Error(`Network error: Failed to connect to the server. Please check your connection and try again.`);
      }
      
      if (!response.ok) {
        let errorMessage = `Failed to ${editingBlogId ? 'update' : 'add'} blog post (Status: ${response.status})`;
        console.error(`Error response status: ${response.status}, statusText: ${response.statusText}`);
        
        try {
          // Check if the response has content before trying to parse it
          const text = await response.text();
          console.log(`Error response body length: ${text.length}`);
          if (text) {
            try {
              const errorData = JSON.parse(text);
              console.log(`Parsed error data:`, errorData);
              if (errorData && errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (jsonError) {
              console.error('Error parsing JSON from response text:', jsonError);
              errorMessage = `Failed to parse error response (Status: ${response.status})`;
            }
          } else {
            // Empty response body
            console.error(`Empty response body from server`);
            errorMessage = `Server returned empty response with status: ${response.status}`;
          }
        } catch (parseError) {
          console.error('Error reading response text:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      let savedBlog;
      try {
        // Clone the response before reading it as text
        const text = await response.text();
        if (text) {
          try {
            savedBlog = JSON.parse(text);
          } catch (jsonError) {
            console.error('Error parsing JSON from response text:', jsonError);
            // Create a fallback blog object in case parsing fails but the API call was successful
            savedBlog = {
              id: editingBlogId || 'unknown',
              ...finalBlogData, // Use the data we sent
              updatedAt: new Date().toISOString(),
            };
            console.log('Using fallback blog object:', savedBlog);
          }
        } else {
          throw new Error('Server returned empty response');
        }
      } catch (parseError) {
        console.error('Error parsing success response:', parseError);
        // Create a fallback blog object to prevent UI issues
        savedBlog = {
          id: editingBlogId || 'unknown',
          ...finalBlogData, // Use the data we sent
          updatedAt: new Date().toISOString(),
        };
        console.log('Using fallback blog object after error:', savedBlog);
      }
      
      console.log("Saved blog post:", savedBlog)
      
      if (editingBlogId) {
        // Update existing blog in state
        setBlogs(prev => 
          prev.map(blog => blog.id === editingBlogId ? savedBlog : blog)
        )
        setBlogSuccess("Blog post updated successfully")
      } else {
        // Add new blog to state
        setBlogs(prev => [...prev, savedBlog])
        setBlogSuccess("Blog post added successfully")
      }
      
      // Reset form
      resetBlogForm()
      
    } catch (error) {
      console.error('Error saving blog post:', error)
      setBlogError(error instanceof Error ? error.message : "Failed to save blog post")
    } finally {
      setIsSubmittingBlog(false)
    }
  }
  
  // Handle education form input changes
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEducationForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Reset education form
  const resetEducationForm = () => {
    setEducationForm({
      universityName: "",
      location: "",
      degree: "",
      startDate: "",
      endDate: null,
      gpa: null,
      logoImageUrl: null,
      courses: [], // Make sure courses is an empty array
      order: 0
    })
    setEditingEducationId(null)
    setUniversityLogoPreview(null)
    setCourseInput("")
  }
  
  // Edit education
  const handleEditEducation = (education: Education) => {
    // Format dates for form input
    const formattedStartDate = new Date(education.startDate).toISOString().split('T')[0]
    const formattedEndDate = education.endDate 
      ? new Date(education.endDate).toISOString().split('T')[0]
      : null
    
    setEducationForm({
      ...education,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      courses: education.courses || [] // Ensure courses is always an array
    })
    
    // Set university logo preview if exists
    if (education.logoImageUrl) {
      setUniversityLogoPreview(education.logoImageUrl)
    } else {
      setUniversityLogoPreview(null)
    }
    
    setEditingEducationId(education.id)
  }
  
  // Handle university logo change
  const handleUniversityLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setEducationError('Please select an image file for the university logo.')
      return
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setUniversityLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  // Submit education form
  const handleEducationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEducationError(null)
    setEducationSuccess(null)
    setIsSubmittingEducation(true)
    
    // Validate required fields
    if (!educationForm.universityName || !educationForm.degree || !educationForm.startDate) {
      setEducationError("University name, degree, and start date are required")
      setIsSubmittingEducation(false)
      return
    }
    
    try {
      // Check if there's a new logo file to upload
      const logoFile = universityLogoInputRef.current?.files?.[0]
      let logoUrl = educationForm.logoImageUrl
      
      // If there's a file and it's different from what we already have
      if (logoFile && universityLogoPreview && universityLogoPreview.startsWith('data:')) {
        // Upload the logo first
        const formData = new FormData()
        formData.append("file", logoFile)
        formData.append("type", "university-logo")
        
        const uploadResponse = await fetch("/api/admin/account/profile-image", {
          method: "POST",
          body: formData,
        })
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "Failed to upload university logo")
        }
        
        const uploadData = await uploadResponse.json()
        console.log("University logo uploaded:", uploadData)
        logoUrl = uploadData.imageUrl
      }
      
      // Prepare the education data with the logo URL
      const formData = {
        ...educationForm,
        logoImageUrl: logoUrl
      }
      
      const method = editingEducationId ? 'PUT' : 'POST'
      const url = editingEducationId 
        ? `/api/education/${editingEducationId}` 
        : '/api/education'
      
      console.log("Submitting education:", formData)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `Failed to ${editingEducationId ? 'update' : 'add'} education`)
      }
      
      const savedEducation = await response.json()
      
      if (editingEducationId) {
        // Update existing education in state
        setEducations(prev => 
          prev.map(edu => edu.id === editingEducationId ? savedEducation : edu)
        )
        setEducationSuccess("Education updated successfully")
      } else {
        // Add new education to state
        setEducations(prev => [...prev, savedEducation])
        setEducationSuccess("Education added successfully")
      }
      
      // Reset form
      resetEducationForm()
      
    } catch (error) {
      console.error('Error saving education:', error)
      setEducationError(error instanceof Error ? error.message : "Failed to save education")
    } finally {
      setIsSubmittingEducation(false)
    }
  }
  
  // Delete education
  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/education/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete education")
      }
      
      // Remove from state
      setEducations(prev => prev.filter(edu => edu.id !== id))
      
    } catch (error) {
      console.error('Error deleting education:', error)
      alert(error instanceof Error ? error.message : "Failed to delete education")
    }
  }
  
  // Handle adding a course
  const handleAddCourse = () => {
    if (courseInput.trim() && !educationForm.courses.includes(courseInput.trim())) {
      setEducationForm(prev => ({
        ...prev,
        courses: [...prev.courses, courseInput.trim()]
      }))
      setCourseInput("")
    }
  }
  
  // Handle removing a course
  const handleRemoveCourse = (indexToRemove: number) => {
    setEducationForm(prev => ({
      ...prev,
      courses: prev.courses.filter((_, index) => index !== indexToRemove)
    }))
  }
  
  // Handle project form input changes
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Project field '${name}' changed to: `, value);
    
    // Special validation for URL fields
    if ((name === 'githubUrl' || name === 'url') && value && !value.startsWith('http')) {
      console.warn(`${name} should start with http:// or https://`);
      // Auto-fix URLs without protocol
      const fixedValue = `https://${value}`;
      console.log(`Auto-fixing ${name} to: ${fixedValue}`);
      
      setProjectForm(prev => ({
        ...prev,
        [name]: fixedValue
      }));
      
      // If it's a DOM input element, update the input value
      if (e.target instanceof HTMLInputElement) {
        e.target.value = fixedValue;
      }
      
      return;
    }
    
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  // Reset project form
  const resetProjectForm = () => {
    setProjectForm({
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: null,
      current: false,
      images: [],
      lessonsLearned: [],
      techStack: [],
      tags: [],
      url: "",
      githubUrl: ""
    })
    setEditingProjectId(null)
    setProjectImagePreviewUrls([])
    setTechInput("")
    setTagInput("")
    setLessonInput("")
  }
  
  // Add tech stack item
  const handleAddTech = () => {
    if (techInput.trim() && !projectForm.techStack.includes(techInput.trim())) {
      setProjectForm(prev => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()]
      }))
      setTechInput("")
    }
  }
  
  // Remove tech stack item
  const handleRemoveTech = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }))
  }
  
  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !projectForm.tags.includes(tagInput.trim())) {
      setProjectForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }
  
  // Remove tag
  const handleRemoveTag = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }
  
  // Handle project image change
  const handleProjectImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if files are images
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) {
        setProjectError('Please select only image files.')
        return
      }
    }

    // Create preview URLs for each file
    const newImagePreviews: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.onloadend = () => {
        setProjectImagePreviewUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Project current state toggle handler
  const handleProjectCurrentToggle = (checked: boolean) => {
    setProjectForm(prev => ({
      ...prev,
      current: checked,
      endDate: checked ? null : prev.endDate
    }))
  }
  
  // Update the handleProjectImageUpload function to handle multiple images
  const handleProjectImageUpload = async () => {
    const files = projectImageInputRef.current?.files
    if (!files || files.length === 0) return []

    setIsUploadingProjectImage(true)
    
    try {
      const uploadedUrls: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to upload image")
        }

        const data = await response.json()
        uploadedUrls.push(data.image.url)
      }
      
      return uploadedUrls
    } catch (error) {
      console.error("Error uploading project images:", error)
      setProjectError(error instanceof Error ? error.message : "Failed to upload images")
      return []
    } finally {
      setIsUploadingProjectImage(false)
    }
  }
  
  // Update handleEditProject to match the new format
  const handleEditProject = (project: Project) => {
    // Format dates for form input
    const formattedStartDate = new Date(project.startDate).toISOString().split('T')[0]
    const formattedEndDate = project.endDate 
      ? new Date(project.endDate).toISOString().split('T')[0]
      : null
    
    setProjectForm({
      ...project,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    })
    
    // Set project image previews if they exist
    if (project.images && Array.isArray(project.images)) {
      setProjectImagePreviewUrls(project.images)
    } else {
      setProjectImagePreviewUrls([])
    }
    
    setEditingProjectId(project.id)
  }
  
  // Add function to remove project image
  const handleRemoveProjectImage = (indexToRemove: number) => {
    setProjectImagePreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove))
  }
  
  // Update the handleProjectSubmit function
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProjectError(null)
    setProjectSuccess(null)
    setIsSubmittingProject(true)
    
    // Validate required fields
    if (!projectForm.title || !projectForm.description || !projectForm.startDate) {
      setProjectError("Title, description, and start date are required")
      setIsSubmittingProject(false)
      return
    }
    
    // No URL validation - accept all URLs as is
    
    try {
      let finalImages = [...projectImagePreviewUrls]
      
      // First, make sure all images are uploaded and we have their URLs
      if (projectImagePreviewUrls.some(url => url.startsWith('data:'))) {
        const uploadedImages = await handleProjectImageUpload()
        if (uploadedImages.length > 0) {
          // Combine already uploaded images (those not starting with data:) with newly uploaded ones
          finalImages = [
            ...projectImagePreviewUrls.filter(url => !url.startsWith('data:')),
            ...uploadedImages
          ]
        }
      }
      
      // Prepare final data - create a clean copy to avoid issues
      const finalProjectData = {
        title: projectForm.title,
        description: projectForm.description,
        location: projectForm.location || "",
        startDate: projectForm.startDate,
        endDate: projectForm.endDate,
        current: projectForm.current || false,
        images: finalImages.filter(url => url && (url.startsWith('http') || url.startsWith('/uploads/'))),
        lessonsLearned: Array.isArray(projectForm.lessonsLearned) ? projectForm.lessonsLearned : [],
        techStack: Array.isArray(projectForm.techStack) ? projectForm.techStack : [],
        tags: Array.isArray(projectForm.tags) ? projectForm.tags : [],
        // Accept URL values as-is without validation
        url: projectForm.url || "",
        githubUrl: projectForm.githubUrl || ""
      }
      
      console.log("Final project data to be submitted:", JSON.stringify(finalProjectData, null, 2));
      console.log("Project githubUrl:", finalProjectData.githubUrl);
      console.log("Project url:", finalProjectData.url);
      
      const method = editingProjectId ? 'PUT' : 'POST'
      const url = editingProjectId 
        ? `/api/projects/${editingProjectId}` 
        : '/api/projects'
      
      console.log(`Sending ${method} request to ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalProjectData)
      })
      
      console.log(`API Response Status: ${response.status} ${response.statusText}`);
      console.log(`API Response Headers:`, Object.fromEntries([...response.headers.entries()]));
      
      // Handle error responses
      if (!response.ok) {
        let errorMessage = `Failed to ${editingProjectId ? 'update' : 'add'} project`;
        
        try {
          // Try to get detailed error info
          const textResponse = await response.text();
          console.log("Error response body:", textResponse);
          
          // Try to parse as JSON if possible
          try {
            const errorData = JSON.parse(textResponse);
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
              if (errorData.details) {
                errorMessage += ': ' + errorData.details;
              }
              console.error("Structured error:", errorData);
            }
          } catch (jsonError) {
            // Not JSON, use text as is
            if (textResponse) {
              errorMessage += `: ${textResponse}`;
            }
          }
        } catch (textError) {
          console.error("Could not get response text:", textError);
          errorMessage += `: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // For successful responses
      let savedProject;
      try {
        const responseText = await response.text();
        console.log("Success response body:", responseText);
        
        if (responseText) {
          savedProject = JSON.parse(responseText);
        } else {
          throw new Error("Empty response received");
        }
      } catch (parseError) {
        console.error('Error parsing success response:', parseError);
        throw new Error('Failed to parse server response. The project may have been saved, but please refresh the page to confirm.');
      }
      
      if (editingProjectId) {
        // Update existing project in state
        setProjects(prev => 
          prev.map(project => project.id === editingProjectId ? savedProject : project)
        )
        setProjectSuccess("Project updated successfully")
      } else {
        // Add new project to state
        setProjects(prev => [...prev, savedProject])
        setProjectSuccess("Project added successfully")
      }
      
      // Reset form
      resetProjectForm()
      
    } catch (error) {
      console.error('Error saving project:', error)
      setProjectError(error instanceof Error ? error.message : "Failed to save project")
    } finally {
      setIsSubmittingProject(false)
    }
  }
  
  // Add handleAddLesson function
  const handleAddLesson = () => {
    if (lessonInput.trim() && !projectForm.lessonsLearned.includes(lessonInput.trim())) {
      setProjectForm(prev => ({
        ...prev,
        lessonsLearned: [...prev.lessonsLearned, lessonInput.trim()]
      }))
      setLessonInput("")
    }
  }
  
  // Add handleRemoveLesson function
  const handleRemoveLesson = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      lessonsLearned: prev.lessonsLearned.filter((_, i) => i !== index)
    }))
  }
  
  // Diagnostic function to test simplified project update
  const testSimpleProjectUpdate = async () => {
    if (!editingProjectId) {
      console.error("No project selected for testing");
      return;
    }
    
    console.log("Testing simple project update with ID:", editingProjectId);
    
    try {
      // Create a minimal data object with just title
      const minimalData = {
        title: projectForm.title,
        description: projectForm.description,
        startDate: projectForm.startDate
      };
      
      console.log("Sending minimal test data:", minimalData);
      
      const response = await fetch(`/api/projects/${editingProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(minimalData)
      });
      
      console.log(`Test response status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      console.log("Test response body:", responseText);
      
      if (response.ok) {
        console.log("Test update successful!");
      } else {
        console.error("Test update failed");
      }
    } catch (error) {
      console.error("Error in test update:", error);
    }
  };
  
  // Add handleDeleteProject function
  const handleDeleteProject = async (id: string) => {
    if (!id) return;
    
    try {
      setDeletingProjectId(id);
      
      // Confirm deletion
      if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
        setDeletingProjectId(null);
        return;
      }
      
      console.log("Deleting project with ID:", id);
      
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error("Error deleting project:", error);
        throw new Error(`Failed to delete project: ${error}`);
      }
      
      // Remove the deleted project from state
      setProjects(prev => prev.filter(project => project.id !== id));
      setProjectSuccess("Project deleted successfully");
      
      // Reset form if we were editing the deleted project
      if (editingProjectId === id) {
        resetProjectForm();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setProjectError(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setDeletingProjectId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Loading profile information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {/* Profile Image Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Image</CardTitle>
                <CardDescription>Upload your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  {imagePreview ? (
                    <div className="relative w-40 h-40 overflow-hidden rounded-full mb-4">
                      <Image 
                        src={imagePreview} 
                        alt="Profile preview" 
                        fill 
                        className="object-cover"
                        unoptimized={true}
                        onError={() => {
                          console.error("Image failed to load:", imagePreview);
                          // Fallback to no image on error
                          setImagePreview(null);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                  
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  
                  <Button 
                    onClick={handleImageUpload} 
                    disabled={isUploading} 
                    className="mt-2 w-full"
                  >
                    {isUploading ? "Uploading..." : "Upload Image"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Details Section */}
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => handleChange(e, 'main', 'name')}
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          onChange={(e) => handleChange(e, 'main', 'email')}
                          placeholder="Your email address"
                          type="email"
                          disabled  // Email is now managed in security settings
                        />
                        <p className="text-xs text-muted-foreground">Managed in security settings</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Professional Title</Label>
                      <Input
                        id="title"
                        value={profile.title}
                        onChange={(e) => handleChange(e, 'main', 'title')}
                        placeholder="e.g. Full Stack Developer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => handleChange(e, 'main', 'location')}
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => handleChange(e, 'main', 'bio')}
                        placeholder="A short description about yourself"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Social Links</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={profile.socialLinks.github}
                          onChange={(e) => handleChange(e, 'social', 'github')}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={profile.socialLinks.linkedin}
                          onChange={(e) => handleChange(e, 'social', 'linkedin')}
                          placeholder="https://linkedin.com/in/yourusername"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={profile.socialLinks.twitter}
                          onChange={(e) => handleChange(e, 'social', 'twitter')}
                          placeholder="https://twitter.com/yourusername"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Personal Website</Label>
                        <Input
                          id="website"
                          value={profile.socialLinks.website}
                          onChange={(e) => handleChange(e, 'social', 'website')}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          {securityErrorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{securityErrorMessage}</AlertDescription>
            </Alert>
          )}
          
          {securitySuccessMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">{securitySuccessMessage}</AlertDescription>
            </Alert>
          )}
          
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Update your password and email address</CardDescription>
            </CardHeader>
            <form onSubmit={handleSecuritySubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={securityData.currentPassword}
                    onChange={handleSecurityChange}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password (Optional)</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={securityData.newPassword}
                    onChange={handleSecurityChange}
                    placeholder="Enter a new password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={handleSecurityChange}
                    placeholder="Confirm your new password"
                    disabled={!securityData.newPassword}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="newEmail">Email Address</Label>
                  <Input
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    value={securityData.newEmail}
                    onChange={handleSecurityChange}
                    placeholder="your.email@example.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">This email will be used for logging in</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSecuritySubmitting}>
                  {isSecuritySubmitting ? "Updating..." : "Update Security Settings"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="experience">
          {experienceError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{experienceError}</AlertDescription>
            </Alert>
          )}
          
          {experienceSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">{experienceSuccess}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {editingExperienceId ? "Edit Experience" : "Add New Experience"}
                </CardTitle>
                <CardDescription>
                  {editingExperienceId 
                    ? "Update your work experience" 
                    : "Add your work experience to your profile"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleExperienceSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={experienceForm.jobTitle}
                      onChange={handleExperienceChange}
                      placeholder="e.g. Senior Data Scientist"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      name="company"
                      value={experienceForm.company}
                      onChange={handleExperienceChange}
                      placeholder="e.g. TechCorp"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={experienceForm.location}
                      onChange={handleExperienceChange}
                      placeholder="e.g. Boston, MA"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={experienceForm.startDate}
                        onChange={handleExperienceChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={experienceForm.endDate || ""}
                        onChange={handleExperienceChange}
                        disabled={experienceForm.current}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="current"
                      checked={experienceForm.current}
                      onCheckedChange={handleCurrentToggle}
                    />
                    <Label htmlFor="current">Current position</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={experienceForm.description}
                      onChange={handleExperienceChange}
                      placeholder="Describe your responsibilities and achievements"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Company Logo (Optional)</Label>
                    <div className="flex flex-col items-center">
                      {companyLogoPreview ? (
                        <div className="relative w-32 h-32 overflow-hidden rounded-md mb-4 border border-gray-200">
                          <Image 
                            src={companyLogoPreview} 
                            alt="Company logo preview" 
                            fill 
                            className="object-contain"
                            unoptimized={true}
                            onError={() => {
                              console.error("Logo image failed to load:", companyLogoPreview);
                              setCompanyLogoPreview(null);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-md bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                          <span className="text-gray-400 text-sm text-center px-2">No logo</span>
                        </div>
                      )}
                      
                      <div className="w-full space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={companyLogoInputRef}
                          onChange={handleCompanyLogoChange}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">Logo will be automatically uploaded when saving</p>
                      </div>
                    </div>
                  </div>
                  
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetExperienceForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmittingExperience}
                  >
                    {isSubmittingExperience 
                      ? "Saving..." 
                      : (editingExperienceId ? "Update Experience" : "Add Experience")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* Experiences List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Experiences</CardTitle>
                <CardDescription>
                  Manage your professional experience history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingExperiences ? (
                  <p>Loading experiences...</p>
                ) : experiences.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No experiences added yet</p>
                    <p className="text-sm">Add your work history to showcase your experience</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="flex items-start justify-between border-b pb-4">
                        <div className="flex items-start gap-3">
                          {exp.companyLogo ? (
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                              <Image 
                                src={exp.companyLogo} 
                                alt={`${exp.company} logo`}
                                fill
                                className="object-contain"
                                unoptimized={true}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                              <span className="text-xs text-gray-400">{exp.company.substring(0, 2)}</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold">{exp.jobTitle}</h3>
                            <p className="text-sm">{exp.company}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(exp.startDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })} - {exp.current 
                                ? 'Present' 
                                : (exp.endDate 
                                  ? new Date(exp.endDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    year: 'numeric' 
                                  }) 
                                  : '')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditExperience(exp)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive" 
                            onClick={() => handleDeleteExperience(exp.id || "")}
                            disabled={deletingExperienceId === exp.id}
                          >
                            {deletingExperienceId === exp.id ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </span>
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="education">
          {educationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{educationError}</AlertDescription>
            </Alert>
          )}
          
          {educationSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">{educationSuccess}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Education Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {editingEducationId ? "Edit Education" : "Add New Education"}
                </CardTitle>
                <CardDescription>
                  {editingEducationId 
                    ? "Update your education details" 
                    : "Add your education to your profile"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEducationSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="universityName">University/School Name *</Label>
                    <Input
                      id="universityName"
                      name="universityName"
                      value={educationForm.universityName}
                      onChange={handleEducationChange}
                      placeholder="e.g. Northeastern University"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree *</Label>
                    <Input
                      id="degree"
                      name="degree"
                      value={educationForm.degree}
                      onChange={handleEducationChange}
                      placeholder="e.g. Master's, Data Science"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={educationForm.location}
                      onChange={handleEducationChange}
                      placeholder="e.g. Boston, MA, USA"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={educationForm.startDate}
                        onChange={handleEducationChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={educationForm.endDate || ""}
                        onChange={handleEducationChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      name="gpa"
                      value={educationForm.gpa || ""}
                      onChange={handleEducationChange}
                      placeholder="e.g. 3.75"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="courses">Courses</Label>
                    <div className="flex gap-2">
                      <Input
                        id="courseInput"
                        value={courseInput}
                        onChange={(e) => setCourseInput(e.target.value)}
                        placeholder="Add a course (e.g. Machine Learning)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCourse();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddCourse}
                      >
                        Add
                      </Button>
                    </div>
                    {educationForm.courses.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {educationForm.courses.map((course, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {course}
                            <button
                              type="button"
                              className="text-xs hover:text-destructive"
                              onClick={() => handleRemoveCourse(index)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Press Enter or click Add to add a course
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="universityLogo">University Logo</Label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <Input
                          id="universityLogo"
                          name="universityLogo"
                          type="file"
                          accept="image/*"
                          onChange={handleUniversityLogoChange}
                          ref={universityLogoInputRef}
                          disabled={isUploadingUniversityLogo}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Upload a logo image for the university/school (optional)
                        </p>
                      </div>
                      
                      {universityLogoPreview && (
                        <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                          <img
                            src={universityLogoPreview}
                            alt="University logo preview"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetEducationForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmittingEducation}
                  >
                    {isSubmittingEducation 
                      ? "Saving..." 
                      : (editingEducationId ? "Update Education" : "Add Education")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* Education List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Education</CardTitle>
                <CardDescription>
                  Manage your education history
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoadingEducations ? (
                  <p>Loading education...</p>
                ) : educations.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No education added yet</p>
                    <p className="text-sm">Add your education to showcase your academic background</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {educations.map((edu) => (
                      <div key={edu.id} className="flex items-start justify-between border-b pb-4">
                        <div className="flex items-start gap-3">
                          {edu.logoImageUrl ? (
                            <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                              <Image 
                                src={edu.logoImageUrl} 
                                alt={`${edu.universityName} logo`}
                                fill
                                className="object-contain"
                                unoptimized={true}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                              <span className="text-xs text-gray-400">{edu.universityName.substring(0, 2)}</span>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium">{edu.universityName}</h4>
                            <p className="text-xs text-muted-foreground">{edu.degree}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                              {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                            </p>
                            {edu.courses && Array.isArray(edu.courses) && edu.courses.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-xs text-muted-foreground">Courses:</span>
                                {edu.courses.slice(0, 2).map((course, idx) => (
                                  <span key={idx} className="text-xs text-muted-foreground">{course}{idx < Math.min(1, edu.courses.length - 1) ? ',' : ''}</span>
                                ))}
                                {edu.courses.length > 2 && <span className="text-xs text-muted-foreground">+{edu.courses.length - 2} more</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEducation(edu)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEducation(edu.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="projects">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Projects</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your projects portfolio
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Project Form */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">
                  {editingProjectId ? "Edit Project" : "Add Project"}
                </h3>
              </CardHeader>
              
              <form onSubmit={handleProjectSubmit}>
                <CardContent className="space-y-4">
                  {projectError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{projectError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {projectSuccess && (
                    <Alert className="bg-green-50 border-green-400">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success</AlertTitle>
                      <AlertDescription className="text-green-700">{projectSuccess}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={projectForm.title}
                      onChange={handleProjectChange}
                      placeholder="e.g. Portfolio Website"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={projectForm.description}
                      onChange={handleProjectChange}
                      placeholder="Describe your project"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={projectForm.location}
                      onChange={handleProjectChange}
                      placeholder="e.g. Remote, New York, or Client Site"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="url">Project URL</Label>
                    <Input
                      id="url"
                      name="url"
                      type="url"
                      value={projectForm.url || ""}
                      onChange={handleProjectChange}
                      placeholder="https://your-project-url.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      The main URL for your project (will be used for the "Visit" button)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      name="githubUrl"
                      type="url"
                      value={projectForm.githubUrl || ""}
                      onChange={handleProjectChange}
                      placeholder="https://github.com/yourusername/your-repo"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to your project's GitHub repository
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={projectForm.startDate}
                        onChange={handleProjectChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={projectForm.endDate || ""}
                        onChange={handleProjectChange}
                        disabled={projectForm.current}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="current" 
                      checked={projectForm.current}
                      onCheckedChange={handleProjectCurrentToggle}
                    />
                    <Label 
                      htmlFor="current"
                      className="font-normal"
                    >
                      This is an ongoing project
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lessonsLearned">Lessons Learned</Label>
                    <div className="flex gap-2">
                      <Input
                        id="lessonInput"
                        value={lessonInput}
                        onChange={(e) => setLessonInput(e.target.value)}
                        placeholder="Add a lesson learned (e.g. CI/CD Integration, Client Communication)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLesson();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddLesson}
                      >
                        Add
                      </Button>
                    </div>
                    {projectForm.lessonsLearned.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {projectForm.lessonsLearned.map((lesson, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {lesson}
                            <button
                              type="button"
                              className="text-xs hover:text-destructive"
                              onClick={() => handleRemoveLesson(index)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Press Enter or click Add to add a lesson learned
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="techStack">Tech Stack</Label>
                    <div className="flex gap-2">
                      <Input
                        id="techInput"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        placeholder="Add a technology (e.g. React, Node.js, AWS)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTech();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddTech}
                      >
                        Add
                      </Button>
                    </div>
                    {projectForm.techStack && projectForm.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {projectForm.techStack.map((tech, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {tech}
                            <button
                              type="button"
                              className="text-xs hover:text-destructive"
                              onClick={() => handleRemoveTech(index)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Press Enter or click Add to add a technology
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tagInput"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag (e.g. Web Development, Mobile App)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddTag}
                      >
                        Add
                      </Button>
                    </div>
                    {projectForm.tags && projectForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {projectForm.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {tag}
                            <button
                              type="button"
                              className="text-xs hover:text-destructive"
                              onClick={() => handleRemoveTag(index)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Press Enter or click Add to add a tag
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectImages">Project Images</Label>
                    <Input
                      id="projectImages"
                      name="projectImages"
                      type="file"
                      accept="image/*"
                      onChange={handleProjectImageChange}
                      ref={projectImageInputRef}
                      disabled={isUploadingProjectImage}
                      multiple
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload images related to your project (stored in AWS S3)
                    </p>
                  </div>
                  
                  {/* Image Previews */}
                  {projectImagePreviewUrls.length > 0 && (
                    <div className="space-y-2">
                      <Label>Image Previews</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {projectImagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square border rounded overflow-hidden">
                            <Image
                              src={url}
                              alt="Project image preview"
                              fill
                              className="object-cover"
                              unoptimized={true}
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                              onClick={() => handleRemoveProjectImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetProjectForm}
                  >
                    Cancel
                  </Button>
                  {editingProjectId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testSimpleProjectUpdate}
                      className="mx-2"
                    >
                      Test Update
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={isSubmittingProject}
                  >
                    {isSubmittingProject 
                      ? "Saving..." 
                      : (editingProjectId ? "Update Project" : "Add Project")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* Projects List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
              </CardHeader>
              
              <CardContent>
                {isLoadingProjects ? (
                  <p>Loading projects...</p>
                ) : projects.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No projects added yet</p>
                    <p className="text-sm">Add your first project to showcase your work</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-start justify-between border-b pb-4">
                        <div className="flex items-start gap-3">
                          {project.images && project.images.length > 0 ? (
                            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                              <Image 
                                src={project.images[0]} 
                                alt={project.title}
                                fill
                                className="object-cover"
                                unoptimized={true}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                              <span className="text-xs text-gray-400">{project.title.substring(0, 2)}</span>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium">{project.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(project.startDate).toLocaleDateString()} - 
                              {project.current ? "Present" : (project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A")}
                            </p>
                            {project.location && (
                              <p className="text-xs text-muted-foreground">{project.location}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {project.description}
                            </p>
                            
                            {project.lessonsLearned && project.lessonsLearned.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-xs text-muted-foreground">Lessons:</span>
                                {project.lessonsLearned.slice(0, 3).map((lesson, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {lesson}
                                  </Badge>
                                ))}
                                {project.lessonsLearned.length > 3 && (
                                  <span className="text-xs text-muted-foreground">+{project.lessonsLearned.length - 3} more</span>
                                )}
                              </div>
                            )}
                            
                            {project.images && project.images.length > 1 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {project.images.length} images
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProject(project)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingProjectId === project.id}
                            onClick={() => handleDeleteProject(project.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="blog">
          {blogError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{blogError}</AlertDescription>
            </Alert>
          )}
          
          {blogSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">{blogSuccess}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blog Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  {editingBlogId ? "Edit Blog Post" : "Add New Blog Post"}
                </CardTitle>
                <CardDescription>
                  {editingBlogId 
                    ? "Update your blog post" 
                    : "Share your experiences and achievements"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleBlogSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={blogForm.title}
                      onChange={handleBlogChange}
                      placeholder="e.g. My Journey Learning React"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={blogForm.location}
                      onChange={handleBlogChange}
                      placeholder="e.g. Boston, MA"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={blogForm.eventDate}
                      onChange={handleBlogChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={blogForm.description}
                      onChange={handleBlogChange}
                      placeholder="Share your experience, what you learned, etc."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="url">Blog URL (Optional)</Label>
                    <Input
                      id="url"
                      name="url"
                      type="url"
                      value={blogForm.url || ""}
                      onChange={handleBlogChange}
                      placeholder="https://your-blog-post-url.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to the original article or related content
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
                    <Input
                      id="githubUrl"
                      name="githubUrl"
                      type="url"
                      value={blogForm.githubUrl || ""}
                      onChange={handleBlogChange}
                      placeholder="https://github.com/yourusername/your-repo"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to related GitHub repository
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
                    <Input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="url"
                      value={blogForm.linkedinUrl || ""}
                      onChange={handleBlogChange}
                      placeholder="https://www.linkedin.com/posts/your-post-id"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to related LinkedIn post
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Skills Learned</Label>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="e.g. React, TypeScript"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddSkill}
                        disabled={!skillInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {blogForm.skillsLearned.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {blogForm.skillsLearned.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="px-2 py-1"
                          >
                            {skill}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-4 w-4 p-0"
                              onClick={() => handleRemoveSkill(index)}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Images (Optional, max 4)</Label>
                    <div className="space-y-4">
                      {/* Display existing images */}
                      {blogForm.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {blogForm.images.map((imgUrl, index) => (
                            <div key={index} className="relative">
                              <div className="relative w-full h-32 rounded-md overflow-hidden border">
                                {imgUrl.startsWith('http') || imgUrl.includes('amazonaws.com') ? (
                                  <img 
                                    src={imgUrl}
                                    alt="Blog image"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Handle image load errors
                                      console.error(`Failed to load external image: ${imgUrl}`);
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = '/placeholder.jpg'; // Fallback image
                                    }}
                                  />
                                ) : (
                                  <Image 
                                    src={imgUrl}
                                    alt="Blog image"
                                    fill
                                    className="object-cover"
                                    unoptimized={true}
                                    onError={() => {
                                      console.error(`Failed to load local image: ${imgUrl}`);
                                    }}
                                  />
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => handleRemoveImage(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Display image previews */}
                      {imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {imagePreviewUrls.filter(url => url.startsWith('data:')).map((imgUrl, index) => (
                            <div key={`preview-${index}`} className="relative">
                              <div className="relative w-full h-32 rounded-md overflow-hidden border">
                                <Image 
                                  src={imgUrl}
                                  alt="Image preview"
                                  fill
                                  className="object-cover"
                                  unoptimized={true}
                                />
                              </div>
                              <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">Preview</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show upload control if less than 4 images */}
                      {blogForm.images.length < 4 && (
                        <div className="w-full space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            ref={blogImageInputRef}
                            onChange={handleBlogImageChange}
                            className="w-full"
                            multiple
                            disabled={blogForm.images.length >= 4}
                          />
                          <p className="text-xs text-muted-foreground">
                            Images will be automatically uploaded when saving the blog post
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetBlogForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmittingBlog}
                  >
                    {isSubmittingBlog 
                      ? "Saving..." 
                      : (editingBlogId ? "Update Blog Post" : "Add Blog Post")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* Blog List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Blog Posts</CardTitle>
                <CardDescription>
                  Manage your blog posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBlogs ? (
                  <p>Loading blog posts...</p>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <PenTool className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No blog posts yet</p>
                    <p className="text-sm">Share your experiences and achievements</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="flex items-start justify-between border-b pb-4">
                        <div className="flex gap-3">
                          {/* Blog thumbnail */}
                          {blog.images && blog.images.length > 0 && (
                            <div className="relative w-16 h-16 overflow-hidden rounded-md border flex-shrink-0">
                              {blog.images[0].startsWith('http') || blog.images[0].includes('amazonaws.com') ? (
                                <img 
                                  src={blog.images[0]} 
                                  alt={blog.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = '/placeholder.jpg';
                                  }}
                                />
                              ) : (
                                <Image
                                  src={blog.images[0]}
                                  alt={blog.title}
                                  fill
                                  className="object-cover"
                                  unoptimized={true}
                                />
                              )}
                              {blog.images.length > 1 && (
                                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1">
                                  +{blog.images.length - 1}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div>
                            <h3 className="font-semibold">{blog.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(blog.eventDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm mt-1 line-clamp-2">{blog.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditBlog(blog)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive" 
                            onClick={() => handleDeleteBlog(blog.id || "")}
                            disabled={deletingBlogId === blog.id}
                          >
                            {deletingBlogId === blog.id ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </span>
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 