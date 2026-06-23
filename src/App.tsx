import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import Battles from "./pages/Battles";
import Analytics from "./pages/Analytics";
import Solution from "./pages/Solutions";
import PageNotFound from "./pages/PageNotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/battles" element={<Battles />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/solutions/:id" element={<Solution />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
