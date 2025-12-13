import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VillasPage from "./pages/VillasPage";
import VillaDetailPage from "./pages/VillaDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import GalleryPage from "./pages/GalleryPage";
import FAQPage from "./pages/FAQPage";
import NotFound from "./pages/NotFound";

// Admin imports
import AdminLayout from "./admin/components/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminAnalytics from "./admin/pages/AdminAnalytics";
import AdminVillas from "./admin/pages/AdminVillas";
import AdminVillaCalendar from "./admin/pages/AdminVillaCalendar";
import AdminBookings from "./admin/pages/AdminBookings";
import AdminBookingCalendar from "./admin/pages/AdminBookingCalendar";
import AdminOffers from "./admin/pages/AdminOffers";
import AdminBlog from "./admin/pages/AdminBlog";
import AdminBlogEditor from "./admin/pages/AdminBlogEditor";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminTestimonials from "./admin/pages/AdminTestimonials";
import AdminGallery from "./admin/pages/AdminGallery";
import AdminSeeder from "./admin/pages/AdminSeeder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/villas" element={<VillasPage />} />
          <Route path="/villas/:id" element={<VillaDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="villas" element={<AdminVillas />} />
            <Route path="villas/:id/calendar" element={<AdminVillaCalendar />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/calendar" element={<AdminBookingCalendar />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/new" element={<AdminBlogEditor />} />
            <Route path="blog/:id/edit" element={<AdminBlogEditor />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="seed" element={<AdminSeeder />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;