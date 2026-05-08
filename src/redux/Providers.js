"use client";

import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Provider } from "react-redux";
import { store } from "./store";

// Component to handle initial auth check
function AuthInitializer({ children }) {
  useAuthCheck();
  return children;
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}

export default Providers;
