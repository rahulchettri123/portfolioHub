"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

type S3Status = {
  isConfigured: boolean
  canListBuckets: boolean
  bucketExists: boolean
  bucketPolicy: string | null
  bucketCors: boolean
  region: string
  bucketName: string
}

export default function S3SetupPage() {
  const [status, setStatus] = useState<S3Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [setupStatus, setSetupStatus] = useState<"idle" | "configuring" | "success" | "error">("idle")

  // Fetch S3 status on component mount
  useEffect(() => {
    async function fetchS3Status() {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/s3-setup")
        
        if (!response.ok) {
          throw new Error("Failed to fetch S3 status")
        }
        
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        console.error("Error fetching S3 status:", err)
        setError("Could not retrieve S3 configuration status. Please check your server logs.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchS3Status()
  }, [])

  // Handle configuring S3
  const handleConfigureS3 = async () => {
    try {
      setSetupStatus("configuring")
      const response = await fetch("/api/admin/s3-setup", {
        method: "POST",
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to configure S3")
      }
      
      setSetupStatus("success")
      // Refresh status after configuration
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      console.error("Error configuring S3:", err)
      setSetupStatus("error")
      setError(err instanceof Error ? err.message : "Failed to configure S3 bucket")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">S3 Setup</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-muted rounded w-full animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
              <div className="h-32 bg-muted rounded w-full animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">S3 Setup</h2>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="guide">Setup Guide</TabsTrigger>
          <TabsTrigger value="policy">IAM Policy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>S3 Configuration Status</CardTitle>
              <CardDescription>
                Check the status of your AWS S3 configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      {status.isConfigured ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        AWS credentials are {status.isConfigured ? "configured" : "not configured"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status.canListBuckets ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        Permission to list buckets: {status.canListBuckets ? "Yes" : "No"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status.bucketExists ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        Bucket "{status.bucketName}" exists: {status.bucketExists ? "Yes" : "No"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status.bucketPolicy ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        Bucket policy configured: {status.bucketPolicy ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-1">Configuration Details:</h3>
                    <p className="text-sm">Region: {status.region}</p>
                    <p className="text-sm">Bucket Name: {status.bucketName}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleConfigureS3} 
                disabled={setupStatus === "configuring" || setupStatus === "success"}
              >
                {setupStatus === "configuring" ? "Configuring..." : 
                 setupStatus === "success" ? "Configured!" : "Auto-configure S3"}
              </Button>
              
              <Button variant="outline" className="ml-2" asChild>
                <Link href="/docs/aws-s3-setup.md" target="_blank">
                  View Setup Guide <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>S3 Setup Guide</CardTitle>
              <CardDescription>
                Follow these steps to set up AWS S3 storage for your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">1. Create an AWS IAM User</h3>
                <p className="text-sm text-muted-foreground">
                  If you haven't already, create an IAM user with programmatic access and the following permissions:
                </p>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li>s3:PutObject</li>
                  <li>s3:GetObject</li>
                  <li>s3:DeleteObject</li>
                  <li>s3:ListBucket</li>
                  <li>s3:ListAllMyBuckets (optional)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">2. Create an S3 Bucket</h3>
                <p className="text-sm text-muted-foreground">
                  Create an S3 bucket and configure its permissions to allow public read access:
                </p>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li>Uncheck "Block all public access" in the bucket permissions</li>
                  <li>Configure CORS to allow uploads from your domain</li>
                  <li>
                    <span className="font-medium">Important:</span> For buckets with Object Ownership set to "Bucket owner enforced", 
                    individual ACLs aren't supported. Instead, use bucket policies for public access.
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">3. Update your Environment Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Set the following variables in your .env file:
                </p>
                <div className="bg-muted p-2 rounded-md text-sm mt-2 font-mono">
                  <p>AWS_REGION=us-east-1</p>
                  <p>AWS_S3_BUCKET=your-bucket-name</p>
                  <p>AWS_ACCESS_KEY_ID=your-access-key</p>
                  <p>AWS_SECRET_ACCESS_KEY=your-secret-key</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">4. Restart your Application</h3>
                <p className="text-sm text-muted-foreground">
                  After setting up everything, restart your application for the changes to take effect.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html" target="_blank">
                  AWS Documentation <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle>Required IAM Policy</CardTitle>
              <CardDescription>
                Use this policy for your AWS IAM user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                <pre className="text-sm">
{`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::${status?.bucketName || 'your-bucket-name'}/*",
                "arn:aws:s3:::${status?.bucketName || 'your-bucket-name'}"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListAllMyBuckets",
            "Resource": "*"
        }
    ]
}`}
                </pre>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Replace 'your-bucket-name' with your actual S3 bucket name if needed.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::${status?.bucketName || 'your-bucket-name'}/*",
                "arn:aws:s3:::${status?.bucketName || 'your-bucket-name'}"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListAllMyBuckets",
            "Resource": "*"
        }
    ]
}`);
                alert('Copied policy to clipboard!');
              }}>
                Copy to Clipboard
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 