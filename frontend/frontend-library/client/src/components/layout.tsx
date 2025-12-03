import { Link, useLocation } from "wouter";
import { authService } from "@/lib/auth-service";
import { Library, Book, LogOut, User, Menu, BookMarked, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    setLocation("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 text-primary">
          <Library className="h-8 w-8" />
          <h1 className="font-serif text-xl font-bold tracking-tight">Kütüphane</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Yönetim Sistemi v1.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link href="/books">
          <Button
            variant={location === "/books" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 font-medium"
            onClick={() => setIsMobileOpen(false)}
          >
            <Book className="h-4 w-4" />
            Kitaplar
          </Button>
        </Link>
        
        <Link href="/loans">
          <Button
            variant={location === "/loans" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 font-medium"
            onClick={() => setIsMobileOpen(false)}
          >
            <BookMarked className="h-4 w-4" />
            Ödünç Kitaplarım
          </Button>
        </Link>
        
        {user?.role === 'ADMIN' && (
          <Link href="/users">
            <Button
              variant={location === "/users" ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 font-medium"
              onClick={() => setIsMobileOpen(false)}
            >
              <Users className="h-4 w-4" />
              Kullanıcı Yönetimi
            </Button>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-sidebar-border bg-sidebar fixed inset-y-0 z-30">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-200 ease-in-out">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border bg-sidebar px-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-primary">
            <Library className="h-6 w-6" />
            <span className="font-serif font-bold">Kütüphane</span>
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r border-sidebar-border">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
