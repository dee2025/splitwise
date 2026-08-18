"use client";

import { Loader2 } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

export default function GoogleIdentityButton({
  clientId,
  onCredential,
  context = "signin",
  loading = false,
  loadingText = "Continuing with Google...",
}) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [buttonReady, setButtonReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(320);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;

    const updateWidth = () => {
      const width = Math.floor(containerRef.current?.getBoundingClientRect().width || 320);
      setButtonWidth(Math.max(240, Math.min(width, 400)));
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const renderGoogleButton = useCallback(() => {
    if (!clientId || !buttonRef.current || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: onCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: buttonWidth,
    });
    requestAnimationFrame(() => setButtonReady(true));
  }, [buttonWidth, clientId, onCredential]);

  useEffect(() => {
    if (scriptReady || window.google?.accounts?.id) {
      renderGoogleButton();
    }
  }, [renderGoogleButton, scriptReady]);

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-semibold leading-5 text-amber-800">
        Google sign-in needs `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setScriptFailed(true)}
      />
      <div className="relative flex min-h-11 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white">
        <div ref={buttonRef} className="flex w-full justify-center" />
        {!buttonReady && (
          <button
            type="button"
            disabled
            className="absolute inset-0 flex w-full items-center justify-center gap-3 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"
            aria-label={context === "signup" ? "Sign up with Google" : "Sign in with Google"}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs font-bold text-slate-700">
              G
            </span>
            Continue with Google
          </button>
        )}
      </div>
      {loading ? (
        <p className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {loadingText}
        </p>
      ) : null}
      {scriptFailed ? (
        <p className="mt-2 text-center text-xs leading-5 text-rose-600">
          Google sign-in could not load. Check browser extensions or allowed domains in Google Cloud.
        </p>
      ) : null}
    </div>
  );
}
