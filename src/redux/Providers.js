"use client";

import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Loader2 } from "lucide-react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";

// Component to handle initial auth check
function AuthInitializer({ children }) {
  useAuthCheck();
  return children;
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
              <p className="text-gray-600">Loading splitzy...</p>
            </div>
          </div>
        }
        persistor={persistor}
      >
        <AuthInitializer>{children}</AuthInitializer>
      </PersistGate>
    </Provider>
  );
}

export default Providers;
