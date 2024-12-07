import React from "react";
import ReactDOM from "react-dom/client";
import "../css/index.css"; // Correct way to import CSS
import "../css/App.css";   // Correct way to import CSS
import { Provider } from "react-redux";
import store from "./redux/store.jsx";
// import "node_modules/antd/dist/reset.css";
// import "./node_modules/slick-carousel/slick/slick.css";
// import "node_modules/slick-carousel/slick/slick-theme.css";
import App from "./App";   // Import App only once

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);
