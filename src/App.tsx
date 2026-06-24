import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";

const Daily = lazy(() => import("./pages/Daily"));
const Battles = lazy(() => import("./pages/Battles"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Solution = lazy(() => import("./pages/Solutions"));

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/daily"
            element={
              <Suspense fallback={null}>
                <Daily />
              </Suspense>
            }
          />
          <Route
            path="/battles"
            element={
              <Suspense fallback={null}>
                <Battles />
              </Suspense>
            }
          />
          <Route
            path="/analytics"
            element={
              <Suspense fallback={null}>
                <Analytics />
              </Suspense>
            }
          />
          <Route
            path="/solutions/:id"
            element={
              <Suspense fallback={null}>
                <Solution />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
