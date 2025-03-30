import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  GraduationCap
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Define types for education data
interface Education {
  id: string;
  universityName: string;
  location: string;
  degree: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  gpa?: string | null;
  logoImageUrl?: string | null;
  courses?: string[];
}

export function EducationSection() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEducations() {
      try {
        const response = await fetch('/api/education');
        if (response.ok) {
          const data = await response.json();
          // Education entries are already sorted by date (newest first) from the API
          setEducations(data);
        } else {
          console.error('Failed to fetch education entries');
        }
      } catch (error) {
        console.error('Error fetching education:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEducations();
  }, []);

  // Format date for display (Month Year)
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading education...</p>
      </div>
    );
  }

  if (educations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {educations.map((edu) => (
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
                  {edu.courses.map((course, index) => (
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