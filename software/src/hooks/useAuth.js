import { useEffect, useState } from "react";
import { api } from "../api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = localStorage.getItem("token");
      if (!t) {
        setLoading(false);
        return;
      }
      try {
        const r = await api.me();
        setUser(r.user);
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  return { user, setUser, loading };
}
