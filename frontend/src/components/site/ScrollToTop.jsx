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

  useEffect(() => {
    const handleSamePageLinkClick = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor) return;

      const targetUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSamePage =
        targetUrl.origin === currentUrl.origin &&
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search &&
        !targetUrl.hash;

      if (isSamePage) {
        window.setTimeout(() => window.scrollTo(0, 0), 0);
      }
    };

    document.addEventListener("click", handleSamePageLinkClick, true);
    return () => document.removeEventListener("click", handleSamePageLinkClick, true);
  }, []);

  return null;
}
