import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.user);
  if (localStorage.getItem("token")) {
    if (user?.email === "aashirdigital@gmail.com") {
      return <Navigate to="/admin-dashboard" />;
    } else {
      return <Navigate to="/" />;
    }
  } else {
    return children;
  }
}
