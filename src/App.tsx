import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage";
import { ArticlePage } from "./pages/ArticlePage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { UsesPage } from "./pages/UsesPage";

function LayoutShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function App() {
  return (
    <LayoutShell>
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
