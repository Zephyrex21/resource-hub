import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import NotesHub from './pages/NotesHub'
import NoteDetail from './pages/NoteDetail'
import TipsHub from './pages/TipsHub'
import TipDetail from './pages/TipDetail'
import ProjectsGrid from './pages/ProjectsGrid'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<NotesHub />} />
        <Route path="/notes/:slug" element={<NoteDetail />} />
        <Route path="/tips" element={<TipsHub />} />
        <Route path="/tips/:slug" element={<TipDetail />} />
        <Route path="/projects" element={<ProjectsGrid />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
