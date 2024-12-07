import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import "./EditUser.css";

const EditUser = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin/admin-edit-user", user, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        message.success(res.data.message);
        navigate("/admin-users");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // get user
  const getUser = async () => {
    try {
      const res = await axios.post(
        "/api/admin/get-client",
        { id: params.id },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <form>
          <div className="page-title">
            <h3 className="m-0">Edit User</h3>
            <button onClick={handleSubmit}>Update</button>
          </div>
          <div className="admin-edit-container">
            <div className="row">
              <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                <div className="form-fields mb-3">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={user?.name}
                  />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                <div className="form-fields mb-3">
                  <input
                    type="text"
                    name="email"
                    className="form-control"
                    onChange={handleChange}
                    value={user?.email}
                  />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                <div className="form-fields mb-3">
                  <input
                    type="text"
                    name="mobile"
                    className="form-control"
                    onChange={handleChange}
                    value={user?.mobile}
                  />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                <div className="form-fields mb-3">
                  <input
                    type="text"
                    name="userGst"
                    className="form-control"
                    onChange={handleChange}
                    value={user?.userGst}
                  />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                <div className="form-fields mb-3">
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    onChange={handleChange}
                    value={user?.address}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-100 b-btn bg-dark text-white"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditUser;
