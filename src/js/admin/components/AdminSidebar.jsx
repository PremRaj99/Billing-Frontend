import React from "react";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InventoryIcon from "@mui/icons-material/Inventory";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="admin-sidebar-container">
      <span className="text-white">
        <small>MAIN</small>
      </span>
      <ul>
        <li
          className={`${location.pathname === "/admin-dashboard" && "active"}`}
        >
          <Link to="/admin-dashboard">
            <DashboardIcon className="me-2" />
            Dashboard
          </Link>
        </li>
      </ul>
      <span className="text-white">
        <small>LISTS</small>
      </span>
      <ul>
        <li
          className={`${location.pathname === "/admin-products" && "active"}`}
        >
          <Link to="/admin-products">
            <InventoryIcon className="me-2" />
            Products
          </Link>
        </li>
        <li
          className={`${location.pathname === "/admin-quotation" && "active"}`}
        >
          <Link to="/admin-quotation">
            <ReceiptIcon className="me-2" />
            Quotation
          </Link>
        </li>
        <li
          className={`${location.pathname === "/admin-estimate" && "active"}`}
        >
          <Link to="/admin-estimate">
            <ReceiptIcon className="me-2" />
            Estimate
          </Link>
        </li>
        <li
          className={`${
            location.pathname === "/admin-estimate-history" && "active"
          }`}
        >
          <Link to="/admin-estimate-history">
            <HistoryIcon className="me-2" />
            Estimate History
          </Link>
        </li>
        <li className={`${location.pathname === "/admin-invoice" && "active"}`}>
          <Link to="/admin-invoice">
            <ReceiptIcon className="me-2" />
            GST Bill
          </Link>
        </li>
        <li className={`${location.pathname === "/admin-users" && "active"}`}>
          <Link to="/admin-users">
            <GroupIcon className="me-2" />
            Customers
          </Link>
        </li>
        {/* <li className={`${location.pathname === "/" && "active"}`}>
          <Link to="/admin-bulk-email">
            <EmailIcon className="me-2" />
            Bulk Email
          </Link>
        </li> */}
      </ul>
    </div>
  );
};

export default AdminSidebar;
