import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { Link, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import axios from "axios";
import { message, Popover } from "antd";
import "./AdminInvoice.css";
import { formatNumber } from "../components/numberUtils";
import { blue } from "@mui/material/colors";

const AdminInvoice = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [totalGst, setTotalGst] = useState(0); // State to hold total GST
  const [totalSales, setTotalSales] = useState(0); // State to hold total GST
  const [totalBills, setTotalBills] = useState(""); // State to hold total GST
  const [showOnlyTable, setShowOnlyTable] = useState(false);

  const gst = (
    <div>
      <p>{totalGst}/-</p>
    </div>
  );
  const sales = (
    <div>
      <p>{totalSales}/-</p>
    </div>
  );

  // Search
  const handleSearch = () => {
    let filtered = data;
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((item) => {
        return item.invoiceId
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase());
      });
    }
    if (query.trim() !== "") {
      filtered = filtered.filter((item) => {
        return item.billingTo.name
          ?.toLowerCase()
          ?.includes(query.toLowerCase());
      });
    }

    if (selectedFrom || selectedTo) {
      filtered = filtered?.filter((item) => {
        const itemDate = new Date(item?.createdAt);
    
        if (selectedFrom && selectedTo) {
          // When both selectedFrom and selectedTo are provided
          return (
            itemDate >= new Date(selectedFrom) && itemDate <= new Date(selectedTo)
          );
        } else if (selectedFrom) {
          // When only selectedFrom is provided
          return itemDate >= new Date(selectedFrom);
        } else if (selectedTo) {
          // When only selectedTo is provided
          return itemDate <= new Date(selectedTo);
        }
    
        return true; // Fallback, though it shouldn't reach here
      });
    }

    if (selectedMonth !== null) {
      filtered = filtered.filter((item) => {
        return new Date(item.invoice.createdAt).getMonth() === selectedMonth;
      });
    }
    setInvoice(filtered);
    // bill
    setTotalBills(filtered?.length);
    //total gst
    const total = filtered?.reduce((acc, curr) => {
      return acc + parseFloat(curr.totalCgst) + parseFloat(curr.totalSgst);
    }, 0);
    setTotalGst(total);
    //total sales
    const sales = filtered?.reduce((acc, curr) => {
      return acc + parseFloat(curr.totalTaxableValue);
    }, 0);
    setTotalSales(sales);
  };

  function clearFilter() {
    setQuery("");
    setSearchQuery("");
    setSelectedFrom("");
    setSelectedTo("");
    setSelectedMonth(null);
  }

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedFrom, selectedTo, selectedMonth, query]);


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure to delete this user?");
    if (confirmDelete) {
      try {
        const res = await axios.post("/api/admin/delete-invoice", {
          invoiceId: id,
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
      const res = await axios.get("/api/invoice/get-all-invoice");
      if (res.data.success) {
        const temp = res.data.data.sort((a, b) => {
          const numA = parseInt(a.invoiceId.replace("IN", ""), 10); // Extract numeric part of invoiceId
          const numB = parseInt(b.invoiceId.replace("IN", ""), 10);
          return numB - numA; // Descending order
        });
        setInvoice(temp);
        setData(res.data.data);
        // calculate total gst
        const total = res.data.data?.reduce((acc, curr) => {
          return acc + parseFloat(curr.totalCgst) + parseFloat(curr.totalSgst);
        }, 0);
        setTotalGst(total);
        //total sales
        const sales = res.data.data?.reduce((acc, curr) => {
          return acc + parseFloat(curr.totalTaxableValue);
        }, 0);
        setTotalSales(sales);
        setTotalBills(res.data.data.length);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const formatNumbertoK = (number) => {
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + "k";
    }
    return number;
  };

  useEffect(() => {
    getAllInvoice();
  }, []);

  return (
    <AdminLayout showOnlyTable={showOnlyTable}>
      <div className="admin-users-container">
        {!showOnlyTable && (
          <>
            <div className="page-title">
              <h3 className="m-0">Invoices</h3>
              <button
                className="b-btn"
                onClick={() => navigate("/admin-add-invoice")}
              >
                Add New
              </button>
            </div>
            <hr />
            <div className="stats-container">
              <Popover content={sales} title="Total Sales">
                <div className="stats-card">
                  <span>
                    <small>Total Sales</small>
                    <h1>
                      <b>{formatNumbertoK(totalSales)}</b>
                    </h1>
                  </span>
                </div>
              </Popover>
              <Popover content={gst} title="Total Gst">
                <div className="stats-card">
                  <span>
                    <small>Total Gst</small>
                    <h1>
                      {/* <b>{totalGst}</b> */}
                      <b>{formatNumbertoK(totalGst)}</b>
                    </h1>
                  </span>
                </div>
              </Popover>
              <div className="stats-card">
                <span>
                  <small>Total Bill</small>
                  <h1>
                    <b>{totalBills}</b>
                  </h1>
                </span>
              </div>
            </div>{" "}
          </>
        )}
        <div className="table-containerr">
          {!showOnlyTable && (
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
                  value={selectedFrom}
                  onChange={(e) => setSelectedFrom(e.target.value)}
                />
              </div>
              <div className="form-fields">
                <input
                  type="date"
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
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
                <button className="bb-btn py-2 " onClick={clearFilter}>
                  Clear Filter
                </button>
                <button
                  className="b-btn py-2 mx-4"
                  onClick={() => {
                    setShowOnlyTable(true);
                    const originalTitle = document.title;

                    setTimeout(() => {
                      document.title = "GST Invoice Details"; // Set desired name
                      window.print();
                      document.title = originalTitle; // Restore original title
                      setShowOnlyTable(false); // Revert back to original view
                    }, 0); // Delay by a few milliseconds
                  }}
                >
                  Print All
                </button>
              </div>
            </div>
          )}
          <table className="table user-table">
            <thead>
              <tr>
                <th>Invoice Id</th>
                <th>Products</th>
                <th>Billing to</th>
                <th>Total Taxable Value</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Created At</th>

                {!showOnlyTable && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {invoice?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <small>{item?.invoiceId}</small>
                    </td>
                    <td>
                      <small>{item?.products?.length}</small>
                    </td>
                    <td>
                      <small>{item?.billingTo?.name}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.totalTaxableValue)}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.totalCgst)}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.totalSgst)}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.grandTotal)}</small>
                    </td>
                    <td>
                      <small>{item?.status}</small>
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
                    {!showOnlyTable && (
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            target="_blank"
                            to={`/admin-print-invoice/${item?.invoiceId}`}
                          >
                            <PrintIcon className="icon text-success" />
                          </Link>
                          <EditIcon
                            onClick={() =>
                              navigate(`/admin-edit-invoice/${item?.invoiceId}`)
                            }
                          />
                          <DeleteIcon
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDelete(item?.invoiceId)}
                            className="text-danger"
                          />
                        </div>
                      </td>
                    )}
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

export default AdminInvoice;
