import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { Loading } from './components/ui/StateViews'
import Home from './pages/Home'
import NotesHub from './pages/NotesHub'
import TipsHub from './pages/TipsHub'
import ProjectsGrid from './pages/ProjectsGrid'
import NotFound from './pages/NotFound'

// Code-split heavier, less-visited routes out of the main bundle:
// react-pdf, the markdown/highlight.js stack, and the admin panel aren't
// needed on most visits.
const NoteDetail = lazy(() => import('./pages/NoteDetail'))
const TipDetail = lazy(() => import('./pages/TipDetail'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<NotesHub />} />
        <Route
          path="/notes/:slug"
          element={
            <Suspense fallback={<Loading label="Loading note viewer…" />}>
              <NoteDetail />
            </Suspense>
          }
        />
        <Route path="/tips" element={<TipsHub />} />
        <Route
          path="/tips/:slug"
          element={
            <Suspense fallback={<Loading label="Loading tip…" />}>
              <TipDetail />
            </Suspense>
          }
        />
        <Route path="/projects" element={<ProjectsGrid />} />
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<Loading />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<Loading label="Loading admin…" />}>
                <AdminDashboard />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
