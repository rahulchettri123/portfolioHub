"use client"

import { redirect } from 'next/navigation'

export default function AdminPage() {
  // The middleware will already catch unauthenticated users and redirect them to login
  // So here we can just redirect to the account page
  redirect('/admin/account')
}

