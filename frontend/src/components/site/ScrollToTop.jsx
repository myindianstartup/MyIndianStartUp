import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable default browser scroll restoration on reload
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    
    // Force scroll to top on mount or route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
