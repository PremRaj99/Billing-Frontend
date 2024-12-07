import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { message } from "antd";
import SearchIcon from "@mui/icons-material/Search";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import axios from "axios";
import "./AdminUsers.css";
import IMAGES from "../img/image";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [allUser, setAllUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    userGst: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin/add-client", form);
      if (res.data.success) {
        message.success(res.data.message);
        setForm({ name: "", userGst: "", mobile: "", address: "" });
        getAllUser();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // delete user
  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure to delete this user?");
    if (confirmDelete) {
      try {
        const res = await axios.post("/api/admin/delete-user", { id });
        if (res.data.success) {
          message.success(res.data.message);
          getAllUser();
        } else {
          message.error(res.data.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Search
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(null);
    } else {
      const filtered = allUser.filter((user) => {
        return user?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredUsers(filtered);
    }
  };
  // get all users
  const getAllUser = async () => {
    try {
      const res = await axios.get("/api/admin/get-all-clients", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setAllUser(res.data.data.reverse());
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSearch(); // Call handleSearch in useEffect
  }, [searchQuery, allUser]);

  useEffect(() => {
    getAllUser(); // Call handleSearch in useEffect
  }, []);

  const filterUser = filteredUsers && filteredUsers ? filteredUsers : allUser;
  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Customers</h3>
          <h6>Total Users - {allUser?.length}</h6>
        </div>
        <hr />

        <div className="table-container">
          <div className="user-entries">
            <div className="tools">
              <div className="form-fields">
                <input
                  className="mb-4"
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
                  {/* <th>Email</th> */}
                  <th>Mobile</th>
                  <th>User Gst</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filterUser?.map((user, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <small>{user?.name}</small>
                      </td>
                      {/* <td>
                        <small>{user?.email}</small>
                      </td> */}
                      <td>
                        <small>{user?.mobile}</small>
                      </td>
                      <td>
                        <small>{user?.userGst}</small>
                      </td>
                      <td>
                        <small>{user?.address}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <EditIcon
                            onClick={() =>
                              navigate(`/admin-edit-user/${user?._id}`)
                            }
                            className="me-2 text-muted"
                          />
                          <DeleteIcon
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDeleteUser(user?._id)}
                            className="text-danger"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="add-user-form-container">
            <h5>Quick Add Client</h5>
            <hr />
            <div className="form-fields mb-3">
              <label htmlFor="">Name</label>
              <input
                onChange={handleChange}
                value={form?.name}
                name="name"
                type="text"
                className="form-control"
              />
            </div>
            <div className="form-fields mb-3">
              <label htmlFor="">Mobile</label>
              <input
                onChange={handleChange}
                value={form?.mobile}
                name="mobile"
                type="text"
                className="form-control"
              />
            </div>
            <div className="form-fields mb-3">
              <label htmlFor="">User Gst</label>
              <input
                onChange={handleChange}
                value={form?.userGst}
                name="userGst"
                type="text"
                className="form-control"
              />
            </div>
            <div className="form-fields mb-3">
              <label htmlFor="">Address</label>
              <input
                onChange={handleChange}
                value={form?.address}
                name="address"
                type="text"
                className="form-control"
              />
            </div>
            <button onClick={handleSubmit} className="py-3 register-btn">
              Add Client
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
