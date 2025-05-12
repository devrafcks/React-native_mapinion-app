import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  initialized: false, // Estado para controlar inicialização

  // Registro de novo usuário
  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (!data.newUser || !data.token) {
        throw new Error("Incomplete registration data");
      }

      // Salva no AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(data.newUser));
      await AsyncStorage.setItem("token", data.token);

      // Atualiza o estado
      set({
        user: data.newUser,
        token: data.token,
        isLoading: false,
        initialized: true,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Login do usuário
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      // Atualiza o estado
      set({
        user: data.user,
        token: data.token,
        isLoading: false,
        initialized: true, 
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Verifica autenticação ao iniciar o app
  checkAuth: async () => {
    try {
      const [user, token] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("token"),
      ]);

      set({
        user: user ? JSON.parse(user) : null,
        token: token || null,
        initialized: true, 
      });
    } catch (error) {
      console.log("Auth check error:", error);
      set({ 
        user: null,
        token: null,
      });
    }
  },

  // Logout do usuário
  logout: async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      set({ 
        user: null,
        token: null,
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  },
}));