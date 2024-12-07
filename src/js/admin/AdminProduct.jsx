import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { message } from "antd";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminUsers.css";

const AdminProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(null);

  // delete product
  const handleDeleteProduct = async (id, images) => {
    const shouldDelete = window.confirm("Are you sure to delete?");
    if (shouldDelete) {
      try {
        const res = await axios.post("/api/product/delete-product", {
          id,
          images,
        });
        if (res.data.success) {
          getAllProducts();
          message.success(res.data.message);
        } else {
          message.error(res.data.message);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // User clicked "Cancel" or closed the dialog
    }
  };

  // Search
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(null);
    } else {
      const filtered = products.filter((product) => {
        return product?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredUsers(filtered);
    }
  };
  // get all products
  const getAllProducts = async () => {
    try {
      const res = await axios.get("/api/product/get-all-products");
      if (res.data.success) {
        setProducts(res.data.data.reverse());
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSearch(); // Call handleSearch in useEffect
  }, [searchQuery, products]);

  useEffect(() => {
    getAllProducts();
  }, []);

  const filterProduct =
    filteredUsers && filteredUsers ? filteredUsers : products;

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Products</h3>
          <button
            className="b-btn"
            onClick={() => navigate("/admin-add-product")}
          >
            Add New
          </button>
        </div>
        <hr />
        <div className="table-containerr">
          <div className="tools">
            <div className="form-fields">
              <input
                className="mb-4 py-2"
                type="search"
                name="search"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <table className="table user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Hsn Code</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filterProduct?.map((product, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <small>{product?.name}</small>
                    </td>
                    <td>
                      <small>{product?.hsnCode}</small>
                    </td>
                    <td>
                      <small>{product?.cgst}</small>
                    </td>
                    <td>
                      <small>{product?.sgst}</small>
                    </td>
                    <td>
                      <small>{product?.price}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <EditIcon
                          onClick={() =>
                            navigate(`/admin-edit-product/${product?._id}`)
                          }
                        />
                        <DeleteIcon
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleDeleteProduct(product?._id, product?.images)
                          }
                          className="text-danger"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination"></div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProduct;
