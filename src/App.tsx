import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  StaticRouter,
  Route,
  Routes,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import Battles from "./pages/Battles";
import Solution from "./pages/Solutions";
import PageNotFound from "./pages/PageNotFound";

const Analytics = lazy(() => import("./pages/Analytics"));

function App({ url }: { url?: string }) {
  const isServer = typeof document === "undefined";
  const Router = isServer ? StaticRouter : BrowserRouter;

  return (
    <Router location={url || "/"}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/daily/page/:page" element={<Daily />} />
          <Route path="/battles" element={<Battles />} />
          <Route path="/battles/page/:page" element={<Battles />} />
          <Route
            path="/analytics"
            element={
              <Suspense
                fallback={
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center font-mono text-sm text-muted-foreground">
                    loading analytics...
                  </div>
                }
              >
                <Analytics />
              </Suspense>
            }
          />
          <Route path="/solutions/:id" element={<Solution />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
