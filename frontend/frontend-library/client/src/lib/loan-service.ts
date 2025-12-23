import apiClient from './api-client';
import { AxiosResponse } from 'axios';
import { User } from './auth-service';
import { Book } from './book-service';

// Types based on OpenAPI spec
export interface Loan {
  id: number;
  user: User;
  book: Book;
  borrowDate: string; // date format
  dueDate: string; // date format
  returnDate: string | null; // date format, nullable
  returned: boolean;
}

export const loanService = {
  /**
   * Kitap ödünç alma (POST /api/loans/borrow/{bookId})
   */
  async borrowBook(bookId: number): Promise<Loan> {
    try {
      const response: AxiosResponse<Loan> = await apiClient.post(`/loans/borrow/${bookId}`);
      return response.data;
    } catch (error: any) {
      console.error("Kitap ödünç alınırken hata oluştu:", error);
      throw new Error(error.response?.data?.message || "Kitap ödünç alınamadı.");
    }
  },

  /**
   * Kitap iade etme (PUT /api/loans/return/{loanId})
   */
  async returnBook(loanId: number): Promise<Loan> {
    try {
      const response: AxiosResponse<Loan> = await apiClient.put(`/loans/return/${loanId}`);
      return response.data;
    } catch (error: any) {
      console.error("Kitap iade edilirken hata oluştu:", error);
      throw new Error(error.response?.data?.message || "Kitap iade edilemedi.");
    }
  },

  /**
   * Gecikmiş ödünç kitapları getir (GET /api/loans/overdue)
   */
  async getOverdueLoans(): Promise<Loan[]> {
    try {
      const response: AxiosResponse<Loan[]> = await apiClient.get('/loans/overdue');
      return response.data;
    } catch (error) {
      console.error("Gecikmiş ödünç kitaplar yüklenirken hata oluştu:", error);
      throw new Error("Gecikmiş ödünç kitaplar yüklenemedi.");
    }
  },

  /**
   * Kendi ödünç geçmişini getir (GET /api/loans/history/my)
   */
  async getMyLoanHistory(): Promise<Loan[]> {
    try {
      const response: AxiosResponse<Loan[]> = await apiClient.get('/loans/history/my');
      return response.data;
    } catch (error) {
      console.error("Ödünç geçmişi yüklenirken hata oluştu:", error);
      throw new Error("Ödünç geçmişi yüklenemedi.");
    }
  },

  /**
   * Kullanıcının ödünç geçmişi - ADMIN ONLY (GET /api/loans/history/{userId})
   */
  async getUserLoanHistory(userId: number): Promise<Loan[]> {
    try {
      const response: AxiosResponse<Loan[]> = await apiClient.get(`/loans/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Ödünç geçmişi yüklenirken hata oluştu:", error);
      throw new Error("Ödünç geçmişi yüklenemedi.");
    }
  },

  /**
   * Get all active loans - ADMIN ONLY (GET /api/loans/active)
   */
  async getAllActiveLoans(): Promise<Loan[]> {
    try {
      const response: AxiosResponse<Loan[]> = await apiClient.get('/loans/active');
      return response.data;
    } catch (error) {
      console.error("Aktif ödünçler yüklenirken hata oluştu:", error);
      throw new Error("Aktif ödünçler yüklenemedi.");
    }
  },
};

