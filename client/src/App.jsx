import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Public pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PublicProfile from './pages/PublicProfile.jsx';

// User pages
import MyReviews from './pages/MyReviews.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Profile from './pages/Profile.jsx';

// Admin pages
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageMovies from './pages/admin/ManageMovies.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageReviews from './pages/admin/ManageReviews.jsx';
import Analytics from './pages/admin/Analytics.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/users/:id" element={<PublicProfile />} />

            {/* Protected — any authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/my-reviews" element={<MyReviews />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Protected — admin only */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/movies" element={<ManageMovies />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/reviews" element={<ManageReviews />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
