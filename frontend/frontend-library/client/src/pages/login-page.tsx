import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { authService } from "@/lib/auth-service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Library, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import libraryBg from "@assets/generated_images/modern_library_interior_with_shelves_of_books.png";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre zorunludur"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login sayfası açıldığında eski session'ı temizle
  useEffect(() => {
    authService.logout();
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      await authService.login(values);
      toast({
        title: "Giriş Başarılı",
        description: "Kütüphane sistemine hoş geldiniz.",
      });
      setLocation("/books");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-muted">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
        <img 
          src={libraryBg} 
          alt="Library Interior" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 m-auto text-white p-12 max-w-xl">
          <h1 className="font-serif text-4xl font-bold mb-6 leading-tight">
            "Bir kütüphane, hayal gücünün sınırsız dünyasına açılan kapıdır."
          </h1>
          <p className="text-lg opacity-90 font-light">
            Modern Kütüphane Yönetim Sistemi ile kaynaklarınızı kolayca yönetin, okuyucularınıza daha iyi hizmet verin.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Library className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-serif">Hoş Geldiniz</CardTitle>
            <CardDescription>
              Devam etmek için lütfen giriş yapınız
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta Adresi</FormLabel>
                      <FormControl>
                        <Input placeholder="ornek@kutuphane.com" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Şifre</FormLabel>
                        <Button variant="link" className="px-0 font-normal text-xs" type="button">
                          Şifremi Unuttum?
                        </Button>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    "Giriş Yap"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto font-medium text-primary"
                onClick={() => setLocation("/register")}
              >
                Kayıt Olun
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
