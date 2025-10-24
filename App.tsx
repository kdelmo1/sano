import { StrictMode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Home from "./screens/home/home";

export default function App() {
  return (
    <StrictMode>
      <SafeAreaProvider>
        <Home></Home>
      </SafeAreaProvider>
    </StrictMode>
  );
}
