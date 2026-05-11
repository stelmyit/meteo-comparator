import { createRoot } from "react-dom/client";

import { App } from "./App.jsx";
import "./styles.css";

const root = document.querySelector("#root");

if (!root) {
  throw new Error("Brak elementu #root.");
}

createRoot(root).render(<App />);
