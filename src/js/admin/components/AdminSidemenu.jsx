import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InventoryIcon from "@mui/icons-material/Inventory";
import CancelIcon from "@mui/icons-material/Cancel";
import { Link } from "react-router-dom";

const AdminSidemenu = ({ menu, setMenu }) => {
  return (
    <div className={`admin-sidemenu-container ${menu && "active"}`}>
      <CancelIcon
        onClick={() => setMenu(!menu)}
        className="text-dark cancel-icon"
      />
      <ul className="sidemenu-ul">
        <li>
          <Link to="/admin-products">
            <InventoryIcon className="me-2" />
            Products
          </Link>
        </li>
        <li>
          <Link to="/admin-quotation">
            <ReceiptIcon className="me-2" />
            Quotation
          </Link>
        </li>
        <li>
          <Link to="/admin-estimate">
            <ReceiptIcon className="me-2" />
            Estimate
          </Link>
        </li>
        <li>
          <Link to="/admin-invoice">
            <ReceiptIcon className="me-2" />
            GST Bill
          </Link>
        </li>
        <li>
          <Link to="/admin-users">
            <GroupIcon className="me-2" />
            Customers
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidemenu;
