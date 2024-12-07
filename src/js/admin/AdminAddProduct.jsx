import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import "./AdminUsers.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminAddProduct.css";
import { message } from "antd";
import CryptoJS from "crypto-js";

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [form, setForm] = useState({
    name: "",
    hsnCode: "",
    // length: "",
    // breadth: "",
    cgst: "",
    sgst: "",
    gst: "",
    price: "",
  });

  const handleAddProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/product/add-product", form);

      if (res.data.success) {
        message.success(res.data.message);
        setLoading(false);
        setForm({
          name: "",
          hsnCode: "",
          // length: "",
          // breadth: "",
          cgst: "",
          sgst: "",
          gst: "",
          price: "",
        });
      } else {
        setLoading(false);
        message.error(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error uploading files:", error);
    }
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Add Product</h3>
        </div>
        <hr />
        <div className="add-product-container">
          <div className="row">
            <div className="form-fields mb-3 col-12 col-sm-12 col-md-6 col-lg-6">
              <input
                className="w-100"
                name="name"
                onChange={handleChange}
                value={form?.name}
                type="text"
                placeholder="Name"
              />
            </div>
            <div className="form-fields mb-3 col-12 col-sm-12 col-md-6 col-lg-6">
              <input
                className="w-100"
                name="hsnCode"
                onChange={handleChange}
                value={form?.hsnCode}
                type="text"
                placeholder="Hsn Code"
              />
            </div>
            {/* <div className="form-fields mb-3 col-12 col-sm-12 col-md-6 col-lg-6">
              <input
                className="w-100"
                name="length"
                onChange={handleChange}
                value={form?.length}
                type="text"
                placeholder="Length"
              />
            </div> */}
            {/* <div className="form-fields mb-3 col-12 col-sm-12 col-md-6 col-lg-6">
              <input
                className="w-100"
                name="breadth"
                onChange={handleChange}
                value={form?.breadth}
                type="text"
                placeholder="Breadth"
              />
            </div> */}
            <div className="form-fields mb-3 col-12 col-sm-12 col-md-4 col-lg-4">
              <input
                className="w-100"
                name="cgst"
                // onChange={handleChange}
                value={form?.cgst}
                disabled={true}
                type="text"
                placeholder="CGST"
              />
            </div>
            <div className="form-fields mb-3 col-12 col-sm-12 col-md-4 col-lg-4">
              <input
                className="w-100"
                name="sgst"
                // onChange={handleChange}
                value={form?.sgst}
                disabled={true}
                type="text"
                placeholder="SGST"
              />
            </div>
            <div className="form-fields mb-3 col-12 col-sm-12 col-md-4 col-lg-4">
              <input
                className="w-100"
                name="gst"
                onChange={async(e) => {
                  // handleChange(e);
                  setForm({ ...form, gst: e.target.value,cgst: e.target.value/2, sgst: e.target.value/2  });
                }}
                value={form?.gst}
                type="text"
                placeholder="GST"
              />
            </div>
            <div className="form-fields mb-3 col-12">
              <input
                className="w-100"
                name="price"
                onChange={handleChange}
                value={form?.price}
                type="text"
                placeholder="Price"
              />
            </div>
          </div>
          <button className="w-100 py-3" onClick={handleAddProduct}>
            Add
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
