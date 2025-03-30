import { ChatInterface } from "@/components/chat-interface"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to home</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Chat with AI</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-lg p-4 mb-6">
          <p className="text-muted-foreground">
            Ask me anything about Rahul's skills, experience, or projects. I can help you understand his background and
            expertise.
          </p>
        </div>

        <ChatInterface />
      </div>
    </div>
  )
}

