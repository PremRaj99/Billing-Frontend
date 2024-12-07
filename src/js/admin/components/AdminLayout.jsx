import React, { useEffect } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const AdminLayout = ({ showOnlyTable = false, children }) => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
      } else {
        navigate("/user-dashboard");
      }
    }
  }, [user]);

  return (
    <div className="admin-layout-container">
      {!showOnlyTable && <AdminHeader />}
      <div className="admin-body">
        {!showOnlyTable && (
          <div className="admin-sidebar d-none d-md-none d-lg-block">
            <AdminSidebar />
          </div>
        )}
        <div className="admin-body-content">{children}</div>
      </div>
      {/* <footer>
        <div className="admin-footer">
          <span>ADMIN</span>
          <span>~aashirdigital</span>
        </div>
      </footer> */}
    </div>
  );
};

export default AdminLayout;
