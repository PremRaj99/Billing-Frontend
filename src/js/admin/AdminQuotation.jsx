import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "./components/AdminLayout";
import { Link, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import axios from "axios";
import { message } from "antd";
import "./AdminInvoice.css";
import { formatNumber } from "../components/numberUtils";
import { useReactToPrint } from "react-to-print";

const AdminQuotation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);

  function handleClearFilter() {
    setQuery("");
    setSearchQuery("");
    setSelectedDate("");
    setSelectedMonth(null);
  }

  // Search
  const handleSearch = () => {
    let filtered = data;
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((item) => {
        return item.quotationId
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase());
      });
    }
    if (query.trim() !== "") {
      filtered = filtered.filter((item) => {
        return item.billingTo?.name
          ?.toLowerCase()
          ?.includes(query.toLowerCase());
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
    setInvoice(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedDate, selectedMonth, query]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(`Are you sure to delete this ${id}?`);
    if (confirmDelete) {
      try {
        const res = await axios.post("/api/admin/delete-quotation", {
          quotationId: id,
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
  };

  async function getAllInvoice() {
    try {
      const res = await axios.get("/api/quotation/get-all-quotation");
      if (res.data.success) {
        const temp = res.data.data.sort((a, b) => {
          const num1 = parseInt(a.quotationId.replace("QT", ""), 10);
          const num2 = parseInt(b.quotationId.replace("QT", ""), 10);
          return num2 - num1;
        });
        setInvoice(temp);
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

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Quotation Bills</h3>
          <button
            className="b-btn"
            onClick={() => navigate("/admin-add-quotation")}
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
                placeholder="Search by Id"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="form-fields">
              <input
                className="mb-4 py-2"
                type="search"
                name="searchname"
                placeholder="Search by Name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
              <button className="bb-btn m-0 ms-2" onClick={handleClearFilter}>
                Clear Filter
              </button>
            </div>
          </div>
          <table className="table user-table">
            <thead>
              <tr>
                <th>Quotation Id</th>
                <th>Products</th>
                <th>Billing to</th>
                <th>Total</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <small>{item?.quotationId}</small>
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
                      <small>
                        {new Date(item?.createdAt).toLocaleString("default", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          target="_blank"
                          to={`/admin-print-quotation/${item?.quotationId}`}
                        >
                          <PrintIcon className="icon text-success" />
                        </Link>
                        <EditIcon
                          onClick={() =>
                            navigate(
                              `/admin-edit-quotation/${item?.quotationId}`
                            )
                          }
                        />
                        <DeleteIcon
                          style={{ cursor: "pointer" }}
                          onClick={() => handleDelete(item?.quotationId)}
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

export default AdminQuotation;
