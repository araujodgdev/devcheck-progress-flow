import { Link } from 'react-router-dom';
import { ListChecks, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <ListChecks className="h-6 w-6" />
              <span className="font-bold">DevCheck</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Streamline your development workflow with efficient project checklists.
            </p>
            <div className="flex gap-4">
              <Link to="#" className="text-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link to="#" className="text-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="text-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Product</h3>
            <Link to="/features" className="text-sm hover:underline">Features</Link>
            <Link to="/pricing" className="text-sm hover:underline">Pricing</Link>
            <Link to="/docs" className="text-sm hover:underline">Documentation</Link>
            <Link to="/integrations" className="text-sm hover:underline">Integrations</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Resources</h3>
            <Link to="/blog" className="text-sm hover:underline">Blog</Link>
            <Link to="/tutorials" className="text-sm hover:underline">Tutorials</Link>
            <Link to="/support" className="text-sm hover:underline">Support</Link>
            <Link to="/changelog" className="text-sm hover:underline">Changelog</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Company</h3>
            <Link to="/about" className="text-sm hover:underline">About</Link>
            <Link to="/careers" className="text-sm hover:underline">Careers</Link>
            <Link to="/contact" className="text-sm hover:underline">Contact</Link>
            <Link to="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-sm hover:underline">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-12 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} DevCheck. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}