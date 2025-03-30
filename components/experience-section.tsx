import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Briefcase, 
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';

// Define types for experience data
interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location?: string | null;
  description?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  current: boolean;
  companyLogo?: string | null;
}

export function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await fetch('/api/experience');
        if (response.ok) {
          const data = await response.json();
          // Experiences are already sorted by date (newest first) from the API
          setExperiences(data);
        } else {
          console.error('Failed to fetch experiences');
        }
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExperiences();
  }, []);

  // Format date for display (Month Year)
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Calculate the duration between two dates in years and months
  const calculateDuration = (startDate: string | Date, endDate: string | Date | null | undefined) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const yearDiff = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();
    
    let years = yearDiff;
    let months = monthDiff;
    
    if (monthDiff < 0) {
      years--;
      months += 12;
    }
    
    const yearText = years > 0 ? `${years} ${years === 1 ? 'yr' : 'yrs'}` : '';
    const monthText = months > 0 ? `${months} ${months === 1 ? 'mo' : 'mos'}` : '';
    
    if (yearText && monthText) {
      return `${yearText}, ${monthText}`;
    } else {
      return yearText || monthText || '< 1 mo';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading experience...</p>
      </div>
    );
  }

  if (experiences.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {experiences.map((exp) => (
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