import apiClient from './api-client';

// Types based on OpenAPI spec
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
  email: string; // OpenAPI spec says email in User schema, assuming login uses email
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// API'den beklediğimiz başarılı giriş yanıtının tipi
interface LoginResponse {
  token: string;
  // Backend'iniz bu bilgileri döndürmüyorsa, User kısmını düzenlememiz gerek.
  user: User; 
}



// Storage keys
const TOKEN_KEY = 'library_auth_token';
const USER_KEY = 'library_auth_user';

// src/services/authService.ts içinde

export const authService = {
  // Promise<LoginResponse> yerine LoginResponse kullanın, çünkü API'den gelen yanıttır.
  // Bu durumda, Promise<{ token: string; user: User }> kullanmak daha doğru.
  async login(credentials: LoginRequest): Promise<{ token: string; user: User }> {
    try {
      // Eski localStorage'ı temizle
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      const response = await apiClient.post('/auth/login', credentials); 
      
      // Backend jwtToken döndürüyor
      const token = (response.data as any).jwtToken || (response.data as any).token;
      
      if (!token) {
        throw new Error('Token bulunamadı!');
      }
      
      // JWT token'dan user bilgisini decode et
      const decodedToken = this.decodeJWT(token);
      
      // User role'ünü belirle
      let userRole = 'USER';
      if (decodedToken.roles && Array.isArray(decodedToken.roles) && decodedToken.roles.length > 0) {
        userRole = decodedToken.roles[0].toString().replace('ROLE_', '');
      } else if (decodedToken.role) {
        userRole = decodedToken.role.toString().replace('ROLE_', '');
      }
      
      const user: User = {
        id: decodedToken.userId || decodedToken.sub || 0,
        email: credentials.email,
        firstName: decodedToken.firstName || 'Kullanıcı',
        lastName: decodedToken.lastName || '',
        role: userRole as 'USER' | 'ADMIN'
      };
      
      // LocalStorage'a kaydet
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return { token, user };
      
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      throw new Error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  },

  // JWT decode helper
  decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT decode error:', error);
      return {};
    }
  },


  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('User parse hatası:', error);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
