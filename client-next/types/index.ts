export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: { url?: string; public_id?: string };
  watchlist: string[] | Movie[];
  createdAt: string;
}

export interface Movie {
  _id: string;
  id?: string;
  title: string;
  description: string;
  releaseYear: number;
  language: string;
  genres: (string | Genre)[];
  cast: { name?: string; role?: string }[] | string[];
  director: string;
  poster?: { url?: string; public_id?: string };
  trailer: string;
  averageRating: number;
  totalReviews: number;
  contentType: 'movie' | 'tv' | 'series';
}

export interface Genre {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
}

export interface Review {
  _id: string;
  id?: string;
  movie: string | Movie;
  user: string | User;
  rating: number;
  comment: string;
  likes?: string[];
  isFlagged?: boolean;
  commentCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  id?: string;
  review: string | Review;
  user: string | User;
  parentComment?: string | Comment;
  text: string;
  likes?: string[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface List {
  _id: string;
  id?: string;
  user: string | User;
  name: string;
  description: string;
  movies: (string | Movie)[];
  isPublic: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  id?: string;
  recipient: string | User;
  type: 'review_like' | 'comment' | 'comment_like' | 'new_movie' | 'system';
  actor?: string | User;
  review?: string | Review;
  comment?: string | Comment;
  movie?: string | Movie;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PublicUserReview {
  _id: string;
  id?: string;
  rating: number;
  comment: string;
  createdAt: string;
  movie: {
    _id: string;
    id?: string;
    title: string;
    poster?: { url?: string; public_id?: string };
  };
}

export interface PublicUserProfile {
  _id: string;
  id?: string;
  name: string;
  avatar?: { url?: string; public_id?: string };
  createdAt: string;
  totalReviews: number;
  averageRatingGiven: number;
  recentReviews?: PublicUserReview[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  [key: string]: unknown;
}

export interface MovieQueryParams extends PaginationParams {
  genre?: string;
  year?: number | string;
  language?: string;
  minRating?: number | string;
  searchMode?: 'title' | 'director' | 'all';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface CreateReviewData {
  movieId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface CreateCommentData {
  reviewId: string;
  text: string;
  parentComment?: string;
}

export interface UpdateCommentData {
  text: string;
}

export interface CreateListData {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateListData {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalMovies: number;
  totalReviews: number;
  avgRating: number;
}

export interface AdminAnalytics {
  monthlyUsers: Array<{ _id: { year: number; month: number }; count: number }>;
  monthlyReviews: Array<{ _id: { year: number; month: number }; count: number }>;
  topMovies: Array<{
    _id: string;
    title: string;
    totalReviews?: number;
    reviewCount?: number;
    poster?: { url?: string; public_id?: string };
    averageRating: number;
  }>;
}
