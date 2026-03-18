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



// ── Interfaces ──────────────────────────────────────────

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

export interface Review {
    id: string;
    rating: number;
    comment: string;
    reviewerId: string;
    reviewedUserId: string;
    transactionId?: string;
    reviewer?: { username: string };
    createdAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface UserInterest {
    id: string;
    userId: string;
    categoryId: string;
    category?: Category;
}

export interface User {
    id: string;
    email: string;
    username: string;
    role: "buyer" | "seller" | "admin";
    isActive?: boolean;
    createdAt?: string;
}

export interface PriceHistoryEntry {
    id: string;
    articleId: string;
    oldPrice: number;
    newPrice: number;
    changedAt: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    articleId: string;
    content: string;
    createdAt: string;
    sender?: { username: string };
}

// ── Helper : fake image URL ─────────────────────────────

export function articleImageUrl(article: Article): string {
    if (article.photoUrls && article.photoUrls.length > 0) {
        return article.photoUrls[0];
    }

    // If the seller did not provide photos, use placehold.co dynamic placeholder.
    // Using the article title helps debugging and makes the UI less “empty”.
    const title = (article.title ?? "No photo").toString().slice(0, 24).trim();
    const textParam = encodeURIComponent(title).replace(/%20/g, "+");
    return `https://placehold.co/600x400/png?text=${textParam}&font=roboto`;
}

// ── API wrappers ────────────────────────────────────────

export const articlesApi = {
    getAll: () => api.get<Article[]>('/articles').then((r) => r.data),
    getOne: (id: string) => api.get<Article>(`/articles/${id}`).then((r) => r.data),
    getMine: () => api.get<Article[]>('/articles/mine').then((r) => r.data),
    getRecommended: () => api.get<Article[]>('/articles/recommended').then((r) => r.data),
    getPriceHistory: (id: string) =>
        api.get<PriceHistoryEntry[]>(`/articles/${id}/price-history`).then((r) => r.data),
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

export const categoriesApi = {
    getAll: () => api.get<Category[]>('/categories').then((r) => r.data),
    create: (data: { name: string; description?: string }) =>
        api.post<Category>('/categories', data).then((r) => r.data),
    delete: (id: string) => api.delete(`/categories/${id}`),
};

export const shopsApi = {
    getAll: () => api.get<Shop[]>('/shops').then((r) => r.data),
    getOne: (id: string) => api.get<Shop>(`/shops/${id}`).then((r) => r.data),
    create: (data: { name: string; description?: string }) =>
        api.post<Shop>('/shops', data).then((r) => r.data),
    update: (id: string, data: Partial<Shop>) =>
        api.put<Shop>(`/shops/${id}`, data).then((r) => r.data),
    delete: (id: string) => api.delete(`/shops/${id}`),
};

export const reviewsApi = {
    getByUser: (userId: string) =>
        api.get<Review[]>(`/reviews/user/${userId}`).then((r) => r.data),
    getAverageRating: (userId: string) =>
        api.get<{ average: number; count: number }>(`/reviews/user/${userId}/rating`).then((r) => r.data),
    create: (data: { rating: number; comment: string; reviewedUserId: string; transactionId?: string }) =>
        api.post<Review>('/reviews', data).then((r) => r.data),
};

export const notificationsApi = {
    getAll: () => api.get<Notification[]>('/notifications').then((r) => r.data),
    getUnread: () => api.get<Notification[]>('/notifications/unread').then((r) => r.data),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
    markAllAsRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};

export const usersApi = {
    getMe: () => api.get('/users/me').then((r) => r.data),
    getInterests: () => api.get<UserInterest[]>('/users/me/interests').then((r) => r.data),
    addInterest: (categoryId: string) =>
        api.post<UserInterest>('/users/me/interests', { categoryId }).then((r) => r.data),
    removeInterest: (categoryId: string) =>
        api.delete(`/users/me/interests/${categoryId}`),
};

export const adminArticlesApi = {
    getPending: () => api.get<Article[]>('/articles/admin/pending').then((r) => r.data),
    moderate: (id: string, status: 'validated' | 'rejected') =>
        api.patch<Article>(`/articles/admin/${id}/moderate`, { status }).then((r) => r.data),
};

export const adminUsersApi = {
    getModerationQueue: () =>
        api.get<User[]>('/users/admin/moderation').then((r) => r.data),
    updateRole: (id: string, role: 'buyer' | 'seller' | 'admin') =>
        api.patch<User>(`/users/admin/${id}/role`, { role }).then((r) => r.data),
};

export const chatApi = {
    getMessages: (articleId: string) =>
        api.get<ChatMessage[]>(`/chat/${articleId}`).then((r) => r.data),
    sendMessage: (articleId: string, receiverId: string, content: string) =>
        api.post<ChatMessage>(`/chat/${articleId}`, { receiverId, content }).then((r) => r.data),
};

export const authApi = {
    register: (data: { email: string; username: string; password?: string }) =>
        api.post('/auth/register', data).then((r) => r.data),
};

export default api;
