import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "./services/api";

function App() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe()
      .then(() => navigate("/dashboard"))
      .catch(() => navigate("/login"))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="spinner" />
    </div>
  );

  return null;
}

export default App; 