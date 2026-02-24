import axios from 'axios';
import keycloak from './keycloak';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                await keycloak.updateToken(30);
                error.config.headers.Authorization = `Bearer ${keycloak.token}`;
                return api.request(error.config);
            } catch {
                keycloak.login();
            }
        }
        return Promise.reject(error);
    },
);

export interface Category {
    id: string;
    name: string;
    description?: string;
}

export interface Shop {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
}

export interface Article {
    id: string;
    title: string;
    description: string;
    price: number;
    shippingCost: number;
    photoUrls: string[];
    condition: 'Neuf' | 'Très bon état' | 'Bon état' | 'Correct';
    status: 'pending' | 'validated' | 'rejected' | 'sold';
    fraudScore: number;
    sellerId: string;
    shopId?: string;
    categoryId?: string;
    seller?: { username: string; email: string };
    shop?: Shop;
    category?: Category;
    createdAt: string;
}

export const articlesApi = {
    getAll: () => api.get<Article[]>('/articles').then((r) => r.data),
    getOne: (id: string) => api.get<Article>(`/articles/${id}`).then((r) => r.data),
    create: (data: {
        title: string;
        description: string;
        price: number;
        shippingCost?: number;
        photoUrls?: string[];
        condition?: string;
        categoryId?: string;
        shopId?: string;
    }) => api.post<Article>('/articles', data).then((r) => r.data),
    update: (id: string, data: Partial<Article>) =>
        api.put<Article>(`/articles/${id}`, data).then((r) => r.data),
    delete: (id: string) => api.delete(`/articles/${id}`),
};

export const usersApi = {
    getMe: () => api.get('/users/me').then((r) => r.data),
};

export default api;
