import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

console.log(
  "%cmidi",
  `
      display: block;
      font-family: 'Arial';
      font-size: 30px;
      text-align: center;
      color: #17110c; background: #8ACE00;
      padding: 30px;
      transform: scale(11);
     `,
);

console.log("Questions? Concerns? Chit-chat? Email me at james@jameslewis.io");

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
