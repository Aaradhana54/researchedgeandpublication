import { Logo } from "@/components/ui/logo"

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} Research Agent Publication. All rights reserved.
          </p>
          <div className="flex gap-4">
             {/* Social links can be added here */}
          </div>
        </div>
      </div>
    </footer>
  )
}
