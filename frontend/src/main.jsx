import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider } from "react-bootstrap";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./components/Auth.jsx";
import { DialogProvider } from "./components/DialogProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <DialogProvider>
        <AuthContextProvider>
          <BrowserRouter future={{ v7_startTransition: true }}>
            <DndProvider backend={HTML5Backend}>
              <App />
            </DndProvider>
          </BrowserRouter>
        </AuthContextProvider>
      </DialogProvider>
    </ThemeProvider>
  </React.StrictMode>
);
