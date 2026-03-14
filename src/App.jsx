import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AdminGuard from './components/admin/AdminGuard'
import Layout from './components/Layout'

// Public pages
const Home         = lazy(() => import('./pages/Home'))
const Movies       = lazy(() => import('./pages/Movies'))
const Series       = lazy(() => import('./pages/Series'))
const MovieDetail  = lazy(() => import('./pages/MovieDetail'))
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'))
const WatchMovie   = lazy(() => import('./pages/WatchMovie'))
const WatchTV      = lazy(() => import('./pages/WatchTV'))
const Search       = lazy(() => import('./pages/Search'))
const Login        = lazy(() => import('./pages/Login'))
const Signup       = lazy(() => import('./pages/Signup'))
const Profile      = lazy(() => import('./pages/Profile'))
const Watchlist    = lazy(() => import('./pages/Watchlist'))

// Admin pages
const AdminLayout      = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminMovies      = lazy(() => import('./pages/admin/AdminMovies'))
const AdminSeries      = lazy(() => import('./pages/admin/AdminSeries'))
const AdminUsers       = lazy(() => import('./pages/admin/AdminUsers'))
const AdminHeroBanners = lazy(() => import('./pages/admin/AdminHeroBanners'))
const AdminSettings    = lazy(() => import('./pages/admin/AdminSettings'))

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-600 text-sm">Loading…</p>
    </div>
  </div>
)

export default function App() {
  const location = useLocation()

  return (
    <>
      <Suspense fallback={<Spinner />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* ── Public ── */}
            <Route element={<Layout />}>
              <Route path="/"                                    element={<Home />} />
              <Route path="/movies"                              element={<Movies />} />
              <Route path="/series"                              element={<Series />} />
              <Route path="/movie/:id"                           element={<MovieDetail />} />
              <Route path="/series/:id"                          element={<SeriesDetail />} />
              <Route path="/search"                              element={<Search />} />
              <Route path="/login"                               element={<Login />} />
              <Route path="/signup"                              element={<Signup />} />
              <Route path="/profile"                             element={<Profile />} />
              <Route path="/watchlist"                           element={<Watchlist />} />
            </Route>

            <Route path="/watch/movie/:tmdbId"                 element={<WatchMovie />} />
            <Route path="/watch/tv/:tmdbId/:season/:episode"   element={<WatchTV />} />

            {/* ── Admin (guarded) ── */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index                element={<AdminDashboard />} />
              <Route path="movies"        element={<AdminMovies />} />
              <Route path="series"        element={<AdminSeries />} />
              <Route path="users"         element={<AdminUsers />} />
              <Route path="hero-banners"  element={<AdminHeroBanners />} />
              <Route path="settings"      element={<AdminSettings />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  )
}
