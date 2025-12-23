import apiClient from './api-client';
import { AxiosResponse } from 'axios';
import { User } from './auth-service';
import { z } from 'zod';

// Zod schema for user update validation
export const updateUserSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  firstName: z.string().min(1, 'Ad zorunludur'),
  lastName: z.string().min(1, 'Soyad zorunludur'),
  role: z.enum(['USER', 'ADMIN']),
  password: z.string().optional(),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;

export const userService = {
  /**
   * Tüm kullanıcıları getir (GET /api/users)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata oluştu:", error);
      throw new Error("Kullanıcı listesi yüklenemedi.");
    }
  },

  /**
   * Kullanıcı güncelle (PUT /api/users/{id})
   */
  async updateUser(userId: number, userData: User): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata oluştu:", error);
      throw new Error("Kullanıcı güncellenemedi.");
    }
  },

  /**
   * Kullanıcı sil (DELETE /api/users/{id})
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}`);
    } catch (error) {
      console.error("Kullanıcı silinirken hata oluştu:", error);
      throw new Error("Kullanıcı silinemedi.");
    }
  },
};


