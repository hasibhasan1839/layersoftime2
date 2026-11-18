import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Drawings from './pages/Drawings.jsx'
import Photography from './pages/Photography.jsx'
import InteriorDesign from './pages/InteriorDesign.jsx'
import Competitions from './pages/Competitions.jsx'
import Team from './pages/Team.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'
import AuthProvider from './admin/AuthContext.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import Login from './admin/Login.jsx'
import Dashboard from './admin/Dashboard.jsx'
import ChangePassword from './admin/ChangePassword.jsx'
import ResourcePage from './admin/ResourcePage.jsx'
import ContactSettings from './admin/ContactSettings.jsx'
import Messages from './admin/Messages.jsx'
import { resources } from './admin/resources.js'

export default function App() {
  return (
    <Routes>
      {/* Admin panel — separate from the public site layout */}
      <Route path="admin" element={<AuthProvider />}>
        <Route path="login" element={<Login />} />
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ResourcePage cfg={resources.projects} />} />
          <Route path="drawings" element={<ResourcePage cfg={resources.drawings} />} />
          <Route path="photography" element={<ResourcePage cfg={resources.photography} />} />
          <Route path="interior-designs" element={<ResourcePage cfg={resources.interiorDesigns} />} />
          <Route path="competitions" element={<ResourcePage cfg={resources.competitions} />} />
          <Route path="team" element={<ResourcePage cfg={resources.team} />} />
          <Route path="messages" element={<Messages />} />
          <Route path="contact" element={<ContactSettings />} />
          <Route path="password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="drawings" element={<Drawings />} />
        <Route path="photography" element={<Photography />} />
        <Route path="interior-design" element={<InteriorDesign />} />
        <Route path="competitions" element={<Competitions />} />
        <Route path="team" element={<Team />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
