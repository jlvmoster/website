import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { LayoutShell } from "./components/LayoutShell";
import { AboutPage } from "./pages/AboutPage";
import { ArticlePage } from "./pages/ArticlePage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { UsesPage } from "./pages/UsesPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <LayoutShell>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/uses" element={<UsesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </LayoutShell>
  );
}
