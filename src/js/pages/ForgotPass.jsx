import React, { useEffect, useState } from "react";
// import Layout from "../components/Layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import axios from "axios";
import { message } from "antd";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  // email otp
  const [otp, setOtp] = useState(null);
  // user enter otp
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  const [tab, setTab] = useState(0);
  const [pass, setPass] = useState("");
  const [cpass, setCpass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const generateOTP = () => {
    const emailOtp = Math.floor(100000 + Math.random() * 900000);
    setOtp(emailOtp);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (email === "") {
      return setError(true);
    }
    try {
      setLoading(true);
      const res = await axios.post("/api/user/send-otp", {
        email,
        msg: "We got your back! For password reset OTP is",
      });
      if (res.data.success) {
        message.success(res.data.message);
        setLoading(false);
        setTab(1);
      } else {
        message.error(res.data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (userEnteredOtp === "") {
      return setError(true);
    }
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/user/verify-otp", {
        email,
        userEnteredOtp,
      });
      if (res.data.success) {
        message.success(res.data.message);
        setTab(2);
        setLoading(false);
      } else {
        setLoading(false);
        message.error(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (pass === "" || cpass === "") {
      return setError(true);
    }
    if (pass !== cpass) {
      return setError(true);
    }
    if (pass === cpass) {
      try {
        const res = await axios.post("/api/user/update-pass", { email, pass });
        if (res.data.success) {
          message.success(res.data.message);
          navigate("/login");
        } else {
          message.error(res.data.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    generateOTP();
  }, []);

  return (
    <>
      <div className="container register-container">
        <div className="row">
          {tab === 0 && (
            <div className="form col-12 col-sm-12 col-md-6 col-lg-6 d-block m-auto">
              <h6>Dont worry! Get Otp on Your Email</h6>
              <hr />
              <div className="mb-3 form-fields">
                <label className="form-label" htmlFor="name">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Registered with us"
                  className="form-control"
                  type="text"
                  required
                />
                <small className="text-danger">
                  {error && email === "" && "Enter email "}
                </small>
              </div>
              <div className="mb-3">
                <button className="register-btn py-2" onClick={handleSendOtp}>
                  {loading ? "Sending" : "Send OTP"}
                  {loading && (
                    <div
                      class="ms-2 spinner-grow spinner-grow-sm"
                      role="status"
                    >
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  )}
                </button>
              </div>
              <hr />
              <p>
                Want to Login? <Link to="/Login">click here</Link>
              </p>
            </div>
          )}
          {tab === 1 && (
            <div className="form col-12 col-sm-12 col-md-6 col-lg-6 d-block m-auto">
              <h6>Reset Your Password</h6>
              <hr />
              <div className="mb-3 form-fields">
                <label className="form-label" htmlFor="name">
                  Verify Your Otp
                </label>
                <input
                  onChange={(e) => setUserEnteredOtp(e.target.value)}
                  placeholder="Enter Otp"
                  className="form-control"
                  type="text"
                  required
                />
                <small className="text-danger">
                  {error && userEnteredOtp === "" && "Enter verification otp"}
                </small>
              </div>
              <div className="mb-3">
                <button className="register-btn" onClick={handleVerifyOtp}>
                  {loading ? "Verifying" : "Verify"}
                  {loading && (
                    <div
                      class="ms-2 spinner-grow spinner-grow-sm"
                      role="status"
                    >
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  )}
                </button>
              </div>
              <hr />
              <p>
                Want to Login? <Link to="/Login">click here</Link>
              </p>
            </div>
          )}
          {tab === 2 && (
            <div className="form col-12 col-sm-12 col-md-6 col-lg-6 d-block m-auto">
              <h6>Set Your Password</h6>
              <hr />
              <div className="mb-3 form-fields">
                <label className="form-label" htmlFor="name">
                  Enter Password
                </label>
                <input
                  onChange={(e) => setPass(e.target.value)}
                  className="form-control"
                  type="text"
                  required
                />
                <small className="text-danger">
                  {error && pass === "" && "Enter password"}
                </small>
              </div>
              <div className="mb-3 form-fields">
                <label className="form-label" htmlFor="name">
                  Confirm Password
                </label>
                <input
                  onChange={(e) => setCpass(e.target.value)}
                  className="form-control"
                  type="text"
                  required
                />
                <small className="text-danger">
                  {error && cpass === "" && "Enter confirm password"}
                </small>
                <small className="text-danger">
                  {error && cpass !== pass && "Password is not matching"}
                </small>
              </div>
              <div className="mb-3">
                <button className="register-btn" onClick={handleUpdatePassword}>
                  {loading ? "Updating" : "Update Password"}
                  {loading && (
                    <div
                      class="ms-2 spinner-grow spinner-grow-sm"
                      role="status"
                    >
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  )}
                </button>
              </div>
              <hr />
              <p>
                Want to Login? <Link to="/Login">click here</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPass;
