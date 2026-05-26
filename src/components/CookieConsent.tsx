import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("nius-cookie-consent");
    if (!consent) {
      setVisible(true);
    } else if (consent === "rejected") {
      disableGA();
    }
  }, []);

  const accept = () => {
    localStorage.setItem("nius-cookie-consent", "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("nius-cookie-consent", "rejected");
    disableGA();
    setVisible(false);
  };

  const disableGA = () => {
    (window as any)["ga-disable-G-VNMLWF0XZG"] = true;
    document.cookie = "_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "_ga_VNMLWF0XZG=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4 md:px-6 md:pb-6"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div
        className="max-w-[600px] mx-auto rounded-lg p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-lg"
        style={{ backgroundColor: 'white', border: '0.5px solid var(--color-border)' }}
      >
        <p className="text-xs font-body flex-1" style={{ color: 'var(--color-text-secondary)' }}>
          We use cookies for analytics (Google Analytics) to improve our service.{" "}
          <Link to="/privacy/" className="underline" style={{ color: 'var(--color-indigo)' }}>Privacy Policy</Link>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={reject}
            className="px-3 py-1.5 rounded text-xs font-body font-medium transition-colors"
            style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border)' }}
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="px-3 py-1.5 rounded text-xs font-body font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-indigo)' }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
