import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AiOutlineUser, AiOutlineLogout } from "react-icons/ai";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your portfolio content",
};

// Admin navigation items - simplified to only keep Account
const navItems = [
  {
    href: "/admin/account",
    label: "Account",
    icon: <AiOutlineUser className="mr-2 h-5 w-5" />,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check for session
  const session = await getServerSession();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Get the user ID for the portfolio link
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email as string
    },
    select: {
      id: true
    }
  });
  
  const userId = user?.id;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="mr-6">
            <span className="text-xl font-bold">PortfolioHub</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            {userId && (
              <Link 
                href={`/${userId}`} 
                className="flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
              >
                View My Portfolio
              </Link>
            )}
            <Link 
              href="/api/auth/signout" 
              className="flex items-center px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium transition-colors hover:bg-red-700"
            >
              <AiOutlineLogout className="mr-2 h-5 w-5" />
              Logout
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/40 p-6">{children}</main>
    </div>
  );
} 