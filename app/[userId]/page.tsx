import Link from "next/link"
import { Github, Linkedin, Twitter, Globe, Mail, MapPin, Briefcase, Calendar, Code, ExternalLink, GraduationCap, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatDate, calculateDuration } from "@/lib/date-utils"
import { getServerSession } from "next-auth"
import { Metadata } from "next"

// Mark as dynamic since we need to use headers/cookies for sessions
export const dynamic = 'force-dynamic';

// This is a server component that receives userId directly
async function UserProfile({ userId }: { userId: string }) {
  // Fetch current session to determine if this is the owner
  const session = await getServerSession();
  
  // Fetch profile data directly from database
  const user = await prisma.user.findFirst({
    where: { id: userId }
  });
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Check if current user is the profile owner
  const isOwner = session?.user?.email === user?.email;
  
  // Fetch experiences directly
  const experiences = await prisma.experience.findMany({
    where: { userId },
    orderBy: [
      { current: 'desc' },
      { endDate: 'desc' },
      { startDate: 'desc' },
      { order: 'asc' }
    ]
  });
  
  // Fetch education entries
  const educations = await prisma.education.findMany({
    where: { userId },
    orderBy: [
      { endDate: 'desc' },
      { startDate: 'desc' },
      { order: 'asc' }
    ]
  });
  
  // Fetch projects directly
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: [
      { startDate: 'desc' }
    ],
    take: 3
  });
  
  // Fetch blogs directly
  const blogs = await prisma.blog.findMany({
    where: { userId },
    orderBy: [
      { eventDate: 'desc' }
    ],
    take: 3
  });
  
  // Default profile data
  const defaultProfile = {
    name: "Rahul Chettri",
    title: "Full Stack Developer",
    bio: "Passionate about building great web applications",
    location: "San Francisco, CA",
    profileImageUrl: "",
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      website: ""
    }
  };
  
  // Transform to the expected format for the public profile
  const profile = {
    name: user?.name || defaultProfile.name,
    title: user?.title || defaultProfile.title,
    bio: user?.bio || defaultProfile.bio,
    location: user?.location || defaultProfile.location,
    profileImageUrl: user?.image || "",
    socialLinks: {
      github: user?.githubUrl || defaultProfile.socialLinks.github,
      linkedin: user?.linkedinUrl || defaultProfile.socialLinks.linkedin,
      twitter: user?.twitterUrl || defaultProfile.socialLinks.twitter,
      website: user?.websiteUrl || defaultProfile.socialLinks.website
    }
  };
  
  // Check if any social links are defined
  const hasSocialLinks = Boolean(
    profile.socialLinks.github || 
    profile.socialLinks.linkedin || 
    profile.socialLinks.twitter || 
    profile.socialLinks.website
  );

  // Get initials for the profile image fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to determine if the image URL is valid
  const hasValidImageUrl = () => {
    const url = profile.profileImageUrl;
    return Boolean(url && url !== '' && url !== '/placeholder-profile.jpg');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {isOwner && (
            <div className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-md">
              Your Portfolio
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Only show navigation when viewing own portfolio */}
          {isOwner && (
            <>
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/admin/account">
                <Button variant="ghost" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span>Account</span>
                </Button>
              </Link>
              <form action="/api/auth/logout" method="get">
                <input type="hidden" name="callbackUrl" value="/" />
                <Button variant="outline" type="submit">Sign Out</Button>
              </form>
            </>
          )}
          
          {/* Only show login/home on the homepage, not on other user portfolios */}
        </div>
      </header>

      <main>
        <section className="mb-16">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-2/3">
              <div className="mb-6">
                <h1 className="text-5xl font-bold mb-3">{profile.name}</h1>
                <h2 className="text-2xl text-muted-foreground">{profile.title}</h2>
              </div>
              
              {profile.location && (
                <p className="text-lg mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {profile.location}
                </p>
              )}
              
              <div className="prose dark:prose-invert max-w-none mb-8">
                <p className="text-base leading-relaxed">
                  {profile.bio}
                </p>
              </div>
              
              {hasSocialLinks && (
                <div className="flex gap-4 mb-6">
                  {profile.socialLinks.github && (
                    <Link href={profile.socialLinks.github} target="_blank">
                      <Button variant="outline" size="icon">
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                      </Button>
                    </Link>
                  )}
                  
                  {profile.socialLinks.linkedin && (
                    <Link href={profile.socialLinks.linkedin} target="_blank">
                      <Button variant="outline" size="icon">
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </Button>
                    </Link>
                  )}
                  
                  {profile.socialLinks.website && (
                    <Link href={profile.socialLinks.website} target="_blank">
                      <Button variant="outline" size="icon">
                        <Globe className="h-5 w-5" />
                        <span className="sr-only">Website</span>
                      </Button>
                    </Link>
                  )}
                  
                  <Link href="mailto:contact@example.com">
                    <Button variant="outline" size="icon">
                      <Mail className="h-5 w-5" />
                      <span className="sr-only">Email</span>
                    </Button>
                  </Link>
                </div>
              )}

              {isOwner && (
                <div className="mt-2">
                  <Link href="/admin/account">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/3 flex justify-center">
              {hasValidImageUrl() ? (
                <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  {/* Use a regular img tag for S3 images to avoid Next.js Image optimization issues */}
                  {profile.profileImageUrl.startsWith('http') ? (
                    <img 
                      src={profile.profileImageUrl} 
                      alt={profile.name}
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  ) : (
                    <Image 
                      src={profile.profileImageUrl} 
                      alt={profile.name} 
                      fill
                      className="object-cover" 
                      priority
                      unoptimized={true}
                    />
                  )}
                </div>
              ) : (
                <div className="w-72 h-72 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center text-5xl font-bold shadow-lg">
                  {getInitials(profile.name)}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border mb-16"></div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 inline-flex items-center">
            <GraduationCap className="mr-2 h-6 w-6 text-primary" />
            Education
          </h2>
          <EducationServerComponent educations={educations} />
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 inline-flex items-center">
            <Briefcase className="mr-2 h-6 w-6 text-primary" />
            Experience
          </h2>
          <ExperienceServerComponent experiences={experiences} />
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold inline-flex items-center">
              <Code className="mr-2 h-6 w-6 text-primary" />
              Featured Projects
            </h2>
            <Link href="/projects">
              <Button variant="outline">View All Projects</Button>
            </Link>
          </div>
          <ProjectsServerComponent projects={projects} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold inline-flex items-center">
              <Globe className="mr-2 h-6 w-6 text-primary" />
              Blogs & Articles
            </h2>
            <Button variant="outline">View All</Button>
          </div>
          <BlogServerComponent blogs={blogs} />
        </section>
        
        {isOwner && blogs.length === 0 && projects.length === 0 && experiences.length === 0 && educations.length === 0 && (
          <div className="mt-8 p-6 border rounded-lg shadow-sm bg-muted/20">
            <h3 className="text-xl font-semibold mb-4">Your portfolio is empty</h3>
            <p className="mb-4">Start by adding your experiences, education, projects or blog posts in the admin dashboard.</p>
            <Link href="/admin/account">
              <Button>Go to Admin Dashboard</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

// Updated wrapper component for the page with proper promise handling for params
export default async function UserDashboard({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}) {
  // Await the params object to get userId
  const { userId } = await params;
  
  // Just pass the userId to the server component
  return <UserProfile userId={userId} />;
}

// Server component for Education
function EducationServerComponent({ educations }: { educations: any[] }) {
  if (educations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {educations.map((edu: any) => (
        <div key={edu.id} className="flex gap-4">
          <div className="flex-shrink-0 mt-1">
            {edu.logoImageUrl ? (
              <div className="w-16 h-16 relative overflow-hidden rounded-md border">
                {edu.logoImageUrl.startsWith('http') ? (
                  <img 
                    src={edu.logoImageUrl} 
                    alt={edu.universityName} 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Image 
                    src={edu.logoImageUrl} 
                    alt={edu.universityName} 
                    width={64}
                    height={64}
                    className="object-contain p-1"
                    unoptimized={true}
                  />
                )}
              </div>
            ) : (
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-md">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">{edu.universityName}</h3>
            <p className="text-base font-medium">{edu.degree}</p>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : 'Present'}
              </span>
            </div>
            
            {edu.location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{edu.location}</span>
              </div>
            )}
            
            {edu.gpa && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <GraduationCap className="h-4 w-4 mr-1" />
                <span>GPA: {edu.gpa}</span>
              </div>
            )}

            {edu.courses && Array.isArray(edu.courses) && edu.courses.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium">Relevant Courses:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {edu.courses.map((course: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Server component for Experience
function ExperienceServerComponent({ experiences }: { experiences: any[] }) {
  if (experiences.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {experiences.map((exp: any) => (
        <div key={exp.id} className="flex gap-4">
          <div className="flex-shrink-0 mt-1">
            {exp.companyLogo ? (
              <div className="w-16 h-16 relative overflow-hidden rounded-md border">
                {exp.companyLogo.startsWith('http') ? (
                  <img 
                    src={exp.companyLogo} 
                    alt={exp.company} 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Image 
                    src={exp.companyLogo} 
                    alt={exp.company} 
                    width={64}
                    height={64}
                    className="object-contain p-1"
                    unoptimized={true}
                  />
                )}
              </div>
            ) : (
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-md">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">{exp.jobTitle}</h3>
            <p className="text-base font-medium">{exp.company}</p>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {formatDate(exp.startDate)} - {exp.current ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : '')}
                {' · '}
                {calculateDuration(exp.startDate, exp.endDate)}
              </span>
            </div>
            
            {exp.location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{exp.location}</span>
              </div>
            )}
            
            {exp.description && (
              <p className="mt-3 text-sm">{exp.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Server component for Projects
function ProjectsServerComponent({ projects }: { projects: any[] }) {
  if (projects.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {projects.map((project: any) => (
        <Card key={project.id} className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          
          {/* Handle images from either images array or imageUrl */}
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
            
            {/* Display project dates in the card content */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {formatDate(project.startDate)} {project.endDate && `- ${formatDate(project.endDate)}`}
                  {project.current && "- Present"}
                </span>
              </div>
              
              {project.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{project.location}</span>
                </div>
              )}
            </div>
            
            {/* Display lessons learned as tags */}
            {project.lessonsLearned && project.lessonsLearned.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.lessonsLearned.map((lesson: string, index: number) => (
                  <Badge key={`${project.id}-lesson-${index}`} variant="secondary">
                    {lesson}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Display tech stack if available */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                {project.techStack.map((tech: string, index: number) => (
                  <span key={`${project.id}-tech-${index}`} className="after:content-[','] last:after:content-[''] after:mr-1">
                    {tech}
                  </span>
                ))}
              </div>
            )}
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
            <Link href={project.url ? project.url : `/projects/${project.id}`} target={project.url ? "_blank" : "_self"}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                {project.url ? "Visit" : "Details"}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Server component for Blog
function BlogServerComponent({ blogs }: { blogs: any[] }) {
  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {blogs.map((post: any) => (
        <Card key={post.id} className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          
          {/* Handle images from either images array or imageUrl */}
          {(post.imageUrl || (post.images && post.images.length > 0)) && (
            <div className="px-6 pb-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                <Link 
                  href={post.url || `/blog/${post.id}`}
                  target={post.url ? "_blank" : "_self"} 
                  className="block w-full h-full"
                >
                  <img 
                    src={post.imageUrl || (post.images && post.images[0])} 
                    alt={post.title}
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
            <p className="text-muted-foreground mb-4">{post.description}</p>
            
            {/* Display blog date and location */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
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
            
            {/* Display skills learned as tags */}
            {post.skillsLearned && post.skillsLearned.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.skillsLearned.map((skill: string, index: number) => (
                  <Badge key={`${post.id}-skill-${index}`} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {post.url ? (
              <Link href={post.url} target="_blank">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Visit
                </Button>
              </Link>
            ) : (
              <span></span>
            )}
            <Link href={post.url ? post.url : `/blog/${post.id}`} target={post.url ? "_blank" : "_self"}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                {post.url ? "Visit Source" : "Details"}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 