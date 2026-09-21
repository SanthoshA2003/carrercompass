import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/components/AuthModal";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
const { refresh, handleGoogleSuccess } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      console.error("Google login token not found");
      navigate("/");
      return;
    }
    // Save JWT token
    localStorage.setItem("dp_token", token);

    // Remove token from browser URL
    window.history.replaceState(
      {},
      document.title,
      "/auth/callback"
    );

    // Get logged-in user
  refresh()
  .then((loggedInUser) => {
    handleGoogleSuccess(loggedInUser);
    navigate("/");
  })
      .catch((error) => {
        console.error("Failed to load user:", error);
        localStorage.removeItem("dp_token");
        navigate("/");
      });
  }, [navigate, refresh, searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h3>Signing you in...</h3>
    </div>
  );
}