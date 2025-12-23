import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookService, insertBookSchema, InsertBook } from "@/lib/book-service";
import { authService } from "@/lib/auth-service";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, BookOpen, Calendar, BarChart3, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BooksPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const currentUser = authService.getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Fetch Books
  const { data: books, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: bookService.getBooks,
  });

  // Add Book Mutation
  const addBookMutation = useMutation({
    mutationFn: bookService.addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Kitap Eklendi",
        description: "Yeni kitap başarıyla envantere eklendi.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kitap eklenirken bir sorun oluştu.",
      });
    },
  });

  // Delete Book Mutation
  const deleteBookMutation = useMutation({
    mutationFn: bookService.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({
        title: "Kitap Silindi",
        description: "Kitap başarıyla envanterden kaldırıldı.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kitap silinirken bir sorun oluştu.",
      });
    },
  });

  // Form Setup
  const form = useForm<InsertBook>({
    resolver: zodResolver(insertBookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      category: "",
      publicationYear: new Date().getFullYear(),
      stockCount: 1,
    },
  });

  function onSubmit(values: InsertBook) {
    addBookMutation.mutate(values);
  }

  // Filter books based on search
  const filteredBooks = books?.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)
  );

  // Stats
  const totalBooks = books?.length || 0;
  const totalStock = books?.reduce((acc, book) => acc + book.stockCount, 0) || 0;
  const categories = new Set(books?.map(b => b.category)).size || 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Kitap Yönetimi</h1>
            <p className="text-muted-foreground mt-1">
              Kütüphane envanterini görüntüleyin{isAdmin ? ' ve yeni kitaplar ekleyin' : ''}.
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  Yeni Kitap Ekle
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Yeni Kitap Ekle</DialogTitle>
                <DialogDescription>
                  Kütüphane envanterine eklemek istediğiniz kitabın detaylarını giriniz.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Kitap Adı</FormLabel>
                          <FormControl>
                            <Input placeholder="Örn: Suç ve Ceza" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Yazar</FormLabel>
                          <FormControl>
                            <Input placeholder="Örn: Fyodor Dostoyevski" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isbn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ISBN</FormLabel>
                          <FormControl>
                            <Input placeholder="978..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <FormControl>
                            <Input placeholder="Örn: Roman" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="publicationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yayın Yılı</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stockCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stok Adedi</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit" disabled={addBookMutation.isPending}>
                      {addBookMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ekleniyor...
                        </>
                      ) : (
                        "Kaydet"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kitap</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBooks}</div>
              <p className="text-xs text-muted-foreground">Başlık mevcut</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Stok</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground">Fiziksel kopya</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories}</div>
              <p className="text-xs text-muted-foreground">Farklı tür</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kitap, yazar veya ISBN ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[300px]">Kitap Adı</TableHead>
                  <TableHead>Yazar</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead className="text-center">Yıl</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Mevcut</TableHead>
                  {isAdmin && <TableHead className="text-right">İşlemler</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Yükleniyor...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBooks?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="h-24 text-center text-muted-foreground">
                      Kitap bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks?.map((book) => (
                    <TableRow key={book.id} className="group">
                      <TableCell className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {book.title}
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/10">
                          {book.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{book.isbn}</TableCell>
                      <TableCell className="text-center">{book.publicationYear}</TableCell>
                      <TableCell className="text-right font-medium">{book.stockCount}</TableCell>
                      <TableCell className="text-right">
                        <span className={book.availableCount > 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                          {book.availableCount}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Kitabı Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{book.title}" kitabını silmek istediğinizden emin misiniz?
                                  Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBookMutation.mutate(book.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleteBookMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Siliniyor...
                                    </>
                                  ) : (
                                    "Sil"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
