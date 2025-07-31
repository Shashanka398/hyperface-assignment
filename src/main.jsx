import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // ← Simple CSS instead of SCSS
import App from "./App.jsx";
import { App as AntdApp } from "antd";
import "@ant-design/v5-patch-for-react-19";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AntdApp>
      <App />
    </AntdApp>
  </StrictMode>
);
