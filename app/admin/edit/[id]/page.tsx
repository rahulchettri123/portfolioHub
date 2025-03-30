import { ProjectForm } from "@/components/project-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to admin</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Project</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <ProjectForm projectId={params.id} />
      </div>
    </div>
  )
}

