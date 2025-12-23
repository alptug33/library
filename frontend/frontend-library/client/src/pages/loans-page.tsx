import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loanService } from "@/lib/loan-service";
import { bookService } from "@/lib/book-service";
import { authService } from "@/lib/auth-service";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, BookPlus, BookCheck, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { tr } from "date-fns/locale";

export default function LoansPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const currentUser = authService.getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Fetch user's loan history
  const { data: userLoans, isLoading: isLoadingUserLoans } = useQuery({
    queryKey: ["loans", "my"],
    queryFn: loanService.getMyLoanHistory,
  });

  // Fetch overdue loans (only for admin)
  const { data: overdueLoans, isLoading: isLoadingOverdue } = useQuery({
    queryKey: ["loans", "overdue"],
    queryFn: loanService.getOverdueLoans,
    enabled: isAdmin,
  });

  // Fetch all active loans (only for admin)
  const { data: allActiveLoans, isLoading: isLoadingAllActive } = useQuery({
    queryKey: ["loans", "active"],
    queryFn: loanService.getAllActiveLoans,
    enabled: isAdmin,
  });

  // Fetch available books for borrowing
  const { data: books } = useQuery({
    queryKey: ["books"],
    queryFn: bookService.getBooks,
  });

  // Borrow Book Mutation
  const borrowMutation = useMutation({
    mutationFn: loanService.borrowBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setIsBorrowDialogOpen(false);
      toast({
        title: "Kitap Ödünç Alındı",
        description: "Kitap başarıyla ödünç alındı.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  // Return Book Mutation
  const returnMutation = useMutation({
    mutationFn: loanService.returnBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({
        title: "Kitap İade Edildi",
        description: "Kitap başarıyla iade edildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  // Filter available books
  const availableBooks = books?.filter((book) => book.availableCount > 0);

  // Filter loans based on search
  const filteredLoans = userLoans?.filter(
    (loan) =>
      loan.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active loans (not returned)
  const activeLoans = filteredLoans?.filter((loan) => !loan.returned) || [];
  const pastLoans = filteredLoans?.filter((loan) => loan.returned) || [];

  // Stats
  const totalBorrowed = activeLoans.length;
  const overdueCount = activeLoans.filter((loan) => isPast(new Date(loan.dueDate))).length;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Ödünç Kitaplarım</h1>
            <p className="text-muted-foreground mt-1">
              Ödünç aldığınız kitapları görüntüleyin ve yönetin.
            </p>
          </div>
          <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <BookPlus className="h-4 w-4" />
                Kitap Ödünç Al
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Kitap Ödünç Al</DialogTitle>
                <DialogDescription>
                  Mevcut kitaplardan ödünç almak istediğinizi seçin.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                {availableBooks?.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{book.title}</h4>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mevcut: {book.availableCount} / {book.stockCount}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => borrowMutation.mutate(book.id)}
                      disabled={borrowMutation.isPending}
                    >
                      {borrowMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Ödünç Al"
                      )}
                    </Button>
                  </div>
                ))}
                {(!availableBooks || availableBooks.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    Şu anda ödünç alınabilecek kitap bulunmamaktadır.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Ödünç</CardTitle>
              <BookCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBorrowed}</div>
              <p className="text-xs text-muted-foreground">Şu anda elinizde</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gecikmiş</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
              <p className="text-xs text-muted-foreground">İade tarihi geçti</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Geçmiş</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userLoans?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Tüm ödünç kayıtları</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kitap veya yazar ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Active Loans Table - Hidden for Admin as they have the global table */}
          {!isAdmin && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Aktif Ödünç Kitaplar</h2>
              <div className="rounded-md border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[300px]">Kitap Adı</TableHead>
                      <TableHead>Yazar</TableHead>
                      <TableHead>Ödünç Tarihi</TableHead>
                      <TableHead>İade Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUserLoans ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Yükleniyor...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : activeLoans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Aktif ödünç kitap bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeLoans.map((loan) => {
                        const isOverdue = isPast(new Date(loan.dueDate));
                        return (
                          <TableRow key={loan.id}>
                            <TableCell className="font-medium">{loan.book.title}</TableCell>
                            <TableCell>{loan.book.author}</TableCell>
                            <TableCell>
                              {format(new Date(loan.borrowDate), "dd MMM yyyy", { locale: tr })}
                            </TableCell>
                            <TableCell>
                              {format(new Date(loan.dueDate), "dd MMM yyyy", { locale: tr })}
                            </TableCell>
                            <TableCell>
                              {isOverdue ? (
                                <Badge variant="destructive">Gecikmiş</Badge>
                              ) : (
                                <Badge variant="secondary">Aktif</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => returnMutation.mutate(loan.id)}
                                disabled={returnMutation.isPending}
                              >
                                İade Et
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Past Loans Table - Visible to everyone, but maybe redundant for admin? keeping for own history */}
          {pastLoans.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Geçmiş Ödünç Kayıtları</h2>
              <div className="rounded-md border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[300px]">Kitap Adı</TableHead>
                      <TableHead>Yazar</TableHead>
                      <TableHead>Ödünç Tarihi</TableHead>
                      <TableHead>İade Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastLoans.map((loan) => (
                      <TableRow key={loan.id} className="opacity-60">
                        <TableCell className="font-medium">{loan.book.title}</TableCell>
                        <TableCell>{loan.book.author}</TableCell>
                        <TableCell>
                          {format(new Date(loan.borrowDate), "dd MMM yyyy", { locale: tr })}
                        </TableCell>
                        <TableCell>
                          {loan.returnDate
                            ? format(new Date(loan.returnDate), "dd MMM yyyy", { locale: tr })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">İade Edildi</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Admin: Overdue Loans */}
        {isAdmin && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Tüm Gecikmiş Kitaplar</h2>
            <div className="rounded-md border border-destructive/50 bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-destructive/10 hover:bg-destructive/10">
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Kitap</TableHead>
                    <TableHead>Ödünç Tarihi</TableHead>
                    <TableHead>İade Tarihi</TableHead>
                    <TableHead>Gecikme Süresi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingOverdue ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Yükleniyor...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : overdueLoans?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Gecikmiş kitap bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    overdueLoans?.map((loan) => {
                      const daysOverdue = Math.floor(
                        (new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <TableRow key={loan.id}>
                          <TableCell>
                            {loan.user.firstName} {loan.user.lastName}
                          </TableCell>
                          <TableCell className="font-medium">{loan.book.title}</TableCell>
                          <TableCell>
                            {format(new Date(loan.borrowDate), "dd MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(loan.dueDate), "dd MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell>
                            <span className="text-destructive font-semibold">{daysOverdue} gün</span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Admin: All Active Loans */}
        {isAdmin && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">Tüm Aktif Ödünçler</h2>
            <div className="rounded-md border border-primary/20 bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Kitap</TableHead>
                    <TableHead>Ödünç Tarihi</TableHead>
                    <TableHead>İade Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAllActive ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Yükleniyor...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : allActiveLoans?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Aktif ödünç bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    allActiveLoans?.map((loan) => {
                      const isOverdue = isPast(new Date(loan.dueDate));
                      return (
                        <TableRow key={loan.id}>
                          <TableCell>
                            {loan.user.firstName} {loan.user.lastName}
                          </TableCell>
                          <TableCell className="font-medium">{loan.book.title}</TableCell>
                          <TableCell>
                            {format(new Date(loan.borrowDate), "dd MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(loan.dueDate), "dd MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell>
                            {isOverdue ? (
                              <Badge variant="destructive">Gecikmiş</Badge>
                            ) : (
                              <Badge variant="secondary">Aktif</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => returnMutation.mutate(loan.id)}
                              disabled={returnMutation.isPending}
                            >
                              İade Et
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

