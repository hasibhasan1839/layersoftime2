import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from './config/routes.js';
import { Layout } from './layout/Layout.jsx';
import { GALLERY_CONFIGS } from './pages/galleryConfigs.js';

// Each page is its own chunk, so a visitor only downloads the pages they open.
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage.jsx'));
const GalleryPage = lazy(() => import('./pages/GalleryPage.jsx'));
const CompetitionsPage = lazy(() => import('./pages/CompetitionsPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.projects} element={<ProjectsPage />} />
        <Route path={ROUTES.projectDetail} element={<ProjectDetailPage />} />
        {GALLERY_CONFIGS.map((config) => (
          <Route key={config.key} path={config.path} element={<GalleryPage config={config} />} />
        ))}
        <Route path={ROUTES.competitions} element={<CompetitionsPage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
