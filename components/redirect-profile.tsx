"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function RedirectToProfile({ userId }: { userId: string }) {
  const router = useRouter()
  
  useEffect(() => {
    router.push(`/${userId}`)
  }, [router, userId])
  
  return null
} 