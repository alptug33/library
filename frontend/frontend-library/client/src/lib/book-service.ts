import { z } from 'zod';
import apiClient from './api-client';
import { AxiosResponse } from 'axios';

// Types based on OpenAPI spec
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publicationYear: number;
  stockCount: number;
  availableCount: number;
}

// Zod schema for form validation
export const insertBookSchema = z.object({
  title: z.string().min(1, 'Kitap adı zorunludur'),
  author: z.string().min(1, 'Yazar adı zorunludur'),
  isbn: z.string().min(10, 'ISBN en az 10 karakter olmalıdır'),
  category: z.string().min(1, 'Kategori zorunludur'),
  publicationYear: z.coerce.number().min(1000, 'Geçerli bir yıl giriniz').max(new Date().getFullYear(), 'Gelecek bir yıl girilemez'),
  stockCount: z.coerce.number().min(1, 'Stok en az 1 olmalıdır'),
});

export type InsertBook = z.infer<typeof insertBookSchema>;

export const bookService = {
  /**
   * Tüm kitapları backend API'den (GET /api/books) çeker.
   */
  async getBooks(): Promise<Book[]> {
    try {
      const response: AxiosResponse<Book[]> = await apiClient.get('/books');
      return response.data;
    } catch (error) {
      console.error("Kitaplar yüklenirken hata oluştu:", error);
      throw new Error("Kitap listesi yüklenemedi. Yetkilendirme hatası olabilir.");
    }
  },
  /**
   * Yeni kitap ekler (POST /api/books).
   */
  async addBook(bookData: InsertBook): Promise<Book> {
    try {
      const response: AxiosResponse<Book> = await apiClient.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error("Kitap eklenirken hata oluştu:", error);
      throw new Error("Kitap ekleme başarısız.");
    }
  },
  
  /**
   * Belirtilen ID'ye sahip kitabı siler (DELETE /api/books/{id}).
   */
  async deleteBook(bookId: number): Promise<void> {
    try {
      await apiClient.delete(`/books/${bookId}`);
    } catch (error) {
      console.error("Kitap silinirken hata oluştu:", error);
      throw new Error("Kitap silme başarısız.");
    }
  },

  /**
   * Belirtilen ID'ye sahip kitabı günceller (PUT /api/books/{id}).
   */
  async updateBook(bookId: number, bookData: InsertBook): Promise<Book> {
    try {
      const response: AxiosResponse<Book> = await apiClient.put(`/books/${bookId}`, bookData);
      return response.data;
    } catch (error) {
      console.error("Kitap güncellenirken hata oluştu:", error);
      throw new Error("Kitap güncelleme başarısız.");
    }
  },
};
