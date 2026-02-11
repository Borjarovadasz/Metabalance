import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export const useAuthGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      try {
        await apiFetch("/api/users/me");
      } catch {
        navigate("/login");
      }
    };
    check();
  }, [navigate]);
};
