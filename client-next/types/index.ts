export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar: string;
  watchlist: string[] | Movie[];
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  language: string;
  genres: (string | Genre)[];
  cast: string[];
  director: string;
  poster: string;
  trailer: string;
  averageRating: number;
  totalReviews: number;
  contentType: 'movie' | 'tv';
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Review {
  id: string;
  movie: string | Movie;
  user: string | User;
  rating: number;
  comment: string;
  likes: string[];
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  review: string | Review;
  user: string | User;
  parentComment?: string | Comment;
  text: string;
  likes: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  user: string | User;
  name: string;
  description: string;
  movies: (string | Movie)[];
  isPublic: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
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
