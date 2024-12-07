import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import "./Register.css";
import "./Login.css";
import IMAGES from "../img/image";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form?.email === "01.mdshahzad@gmail.com") {
      try {
        const res = await axios.post("/api/user/admin", form);
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          navigate("/admin-dashboard");
        } else {
          message.error(res.data.message);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const res = await axios.post("/api/user/login", form);
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          navigate("/user-dashboard");
        } else {
          message.error(res.data.message);
        }
      } catch (error) {
        console.log(error);
        message.error("Something went wrong");
      }
    }
  };

  useEffect(() => {
    localStorage.removeItem("token");
    console.log("running...");
  }, []);

  return (
    <div className="container-fluid">
      <div className="login-form">
        <form className="register-form" onSubmit={handleSubmit}>
          <img src={IMAGES.login} alt="" />
          <h2>Login</h2>
          <div className="form-fields mb-3">
            <input
              onChange={handleChange}
              value={form?.email}
              name="email"
              type="email"
              className="form-control"
              placeholder="Email"
            />
          </div>
          <div className="form-fields mb-3">
            <input
              onChange={handleChange}
              value={form?.password}
              name="password"
              type="text"
              className="form-control"
              placeholder="Password"
            />
          </div>
          <button className="b-btn w-100 text-white">Login</button>
          <div className="forgot-pass d-flex justify-content-between">
            <h6 className="text-center my-2">
              Forgot Password? <Link to="/forgot-password">Click Here</Link>
            </h6>
          </div>
        </form>
      </div>
      <div className="circletop"></div>
      <div className="circletoptwo"></div>
      <div className="circletopthree"></div>
      <div className="circlebottom"></div>
      <div className="circlebottomTwo"></div>
      <div className="circlebottomThree"></div>
      <div className="dot-c">
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
        <div className="dot">
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Login;
