import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout({ children }) {
  const { user } = useAuth();

  const role = user?.role || "guest";

  return (
    <div className="app">
      <header className="navbar">
        <h2>📚 Concours+</h2>

        <nav>
          <Link to="/">Accueil</Link>
          {role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
      </header>

      <main className="container">
        {children}
      </main>
    </div>
  );
}