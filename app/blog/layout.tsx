import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold">Portfolio</h1>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/projects">
            <Button variant="ghost">Projects</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Admin</Button>
          </Link>
        </div>
      </header>
      
      <main>{children}</main>
    </>
  );
} 