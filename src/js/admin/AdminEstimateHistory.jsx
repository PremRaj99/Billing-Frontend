import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message, Popover } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";
import "./AdminInvoice.css";
import { formatNumber } from "../components/numberUtils";

const AdminEstimateHistory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [totalPaymentGiven, setTotalPaymentGiven] = useState(0); // Initialize totalPaymentGiven state

  function handleClearFilter() {
    setSearchQuery("");
    setSelectedDate("");
    setSelectedMonth(null);
  }

  // Search
  const handleSearch = () => {
    let filtered = data;
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((item) => {
        return item.estimateId
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase());
      });
    }
    if (selectedDate) {
      filtered = filtered?.filter((item) => {
        return (
          new Date(item?.createdAt).toDateString() ===
          new Date(selectedDate).toDateString()
        );
      });
    }
    if (selectedMonth !== null) {
      filtered = filtered.filter((item) => {
        return new Date(item?.createdAt).getMonth() === selectedMonth;
      });
    }
    const total = filtered?.reduce(
      (acc, item) => parseInt(acc) + parseInt(item.paymentGiven),
      0
    );
    setTotalPaymentGiven(total);
    setInvoice(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedDate, selectedMonth]);

  async function handleDelete(id) {
    const confirm = window.confirm("Are you sure to delete?");
    if (confirm) {
      try {
        const res = await axios.post("/api/estimate/delete-est-history", {
          id: id,
        });
        if (res.data.success) {
          message.success(res.data.message);
          getAllInvoice();
        } else {
          message.error(res.data.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function getAllInvoice() {
    try {
      const res = await axios.get("/api/estimate/get-all-estimate-history");
      if (res.data.success) {
        setInvoice(res.data.data.reverse());
        setData(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAllInvoice();
  }, []);

  useEffect(() => {
    if (invoice) {
      const total = invoice?.reduce(
        (acc, item) => parseInt(acc) + parseInt(item.paymentGiven),
        0
      );
      setTotalPaymentGiven(total);
    }
  }, [invoice]);

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Estimate Bills</h3>
          <button
            className="b-btn"
            onClick={() => navigate("/admin-add-estimate")}
          >
            Add New
          </button>
        </div>
        <hr />
        <div className="stats-container">
          <div className="stats-card">
            <span>
              <small>Total Payment Received</small>
              <h1>
                <b>{totalPaymentGiven}</b>
              </h1>
            </span>
          </div>
          {/* <div className="stats-card">
            <span>
              <small>Total Gst</small>
              <h1></h1>
            </span>
          </div> */}
          {/* <div className="stats-card">
            <span>
              <small>Total Bill</small>
              <h1>
              </h1>
            </span>
          </div> */}
        </div>
        <div className="table-containerr">
          <div className="tools">
            <div className="form-fields">
              <input
                className="mb-4 py-2"
                type="search"
                name="search"
                placeholder="Search by ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="form-fields">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="form-fields">
              <select
                value={selectedMonth === null ? "" : selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value === "" ? null : parseInt(e.target.value)
                  )
                }
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }).map((_, index) => (
                  <option key={index} value={index}>
                    {new Date(null, index).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-fields">
              <button className="bb-btn ms-2 m-0" onClick={handleClearFilter}>
                Clear Filter
              </button>
            </div>
          </div>
          <table className="table user-table">
            <thead>
              <tr>
                <th>Estimate Id</th>
                <th>Products</th>
                <th>Billing to</th>
                <th>Total Value</th>
                <th>Discount</th>
                <th>Payment Given</th>
                <th>Balance Payment</th>
                <th>Payment Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <small>{item?.estimateId}</small>
                    </td>
                    <td>
                      <small>{item?.products?.length}</small>
                    </td>
                    <td>
                      <small>{item?.billingTo?.name}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.totalValue)}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.discount)}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.paymentGiven)}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.balancePayment)}</small>
                    </td>
                    <td>
                      <small>
                        {new Date(item?.invoice?.createdAt).toLocaleString(
                          "default",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </small>
                    </td>
                    <td>
                      <DeleteIcon
                        onClick={() => handleDelete(item?._id)}
                        className="icon text-danger"
                        style={{ cursor: "pointer" }}
                      />
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

export default AdminEstimateHistory;
