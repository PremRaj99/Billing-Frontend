import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { Link, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import "./AdminInvoice.css";
import axios from "axios";
import { message, Modal } from "antd";
import { formatNumber } from "../components/numberUtils";
import PaymentIcon from "@mui/icons-material/Payment";

const AdminEstimate = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [query, setQuery] = useState("");
  // const [selectedDate, setSelectedDate] = useState("");
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectBalance, setSelectBalance] = useState("");
  const [showOnlyTable, setShowOnlyTable] = useState(false); // New state for toggle

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showOnlyModelTable, setShowOnlyModelTable] = useState(false);
  const [billHistory, setBillHistory] = useState([]);
  const [selectedEstimateId, setSelectedEstimateId] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [receiveAmountData, setReceiveAmountData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "phonepe",
  });

  const showModal = (bill, index) => {
    setSelectedBill(bill); // Set the selected bill's data
    setSelectedEstimateId(bill._id);
    setIsModalOpen(true); // Open the modal
    setSelectedIndex(index);
  };

  const handleModalOK = async (e) => {
    await handleReceiveAmountDataSubmit(e, selectedEstimateId);
    setIsModalOpen(false);
    setSelectedBill(null); // Clear the selected bill data when closing the modal
  };

  const handleModalClose = (e) => {
    setIsModalOpen(false); // Close the modal
    setSelectedBill(null); // Clear the selected bill data when closing the modal
  };

  function handleClearFilter() {
    setQuery("");
    setSearchQuery("");
    setSelectedFrom("");
    setSelectedTo("");
    setSelectedMonth(null);
    setSelectBalance("");
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
            itemDate >= new Date(selectedFrom) &&
            itemDate <= new Date(selectedTo)
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
        return new Date(item?.createdAt).getMonth() === selectedMonth;
      });
    }
    if (selectBalance !== "") {
      if (selectBalance === "yes") {
        filtered = filtered.filter((item) => {
          return item?.balancePayment > 0;
        });
      }
    }
    setInvoice(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [
    query,
    searchQuery,
    selectedFrom,
    selectedTo,
    selectedMonth,
    selectBalance,
  ]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(`Are you sure to delete this ${id} ?`);
    if (confirmDelete) {
      try {
        const res = await axios.post("/api/admin/delete-estimate", {
          estimateId: id,
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
      const res = await axios.get("/api/estimate/get-all-estimate");
      if (res.data.success) {
        const temp = res.data.data.sort((a, b) => {
          const numA = parseInt(a.estimateId.replace("ES", ""), 10); // Extract numeric part of invoiceId
          const numB = parseInt(b.estimateId.replace("ES", ""), 10);
          return numB - numA; // Descending order
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

  const getReceiveAmountHistory = async (id) => {
    try {
      const res = await axios.get(`/api/receivePayment/${id}`);
      console.log(res.data);
      if (res.data.success) {
        setBillHistory(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReceiveAmountDataSubmit = async (e, id) => {
    e.preventDefault();
    try {
      if (
        receiveAmountData.amount === "" ||
        receiveAmountData.paymentDate === "" ||
        receiveAmountData.paymentMethod === ""
      )
        return message.error("Please fill all the require field");
      const res = await axios.post(
        "/api/receivePayment/" + id,
        receiveAmountData
      );

      if (res.data.success) {
        message.success(res.data.message);
        setSelectedBill({
          ...selectedBill,
          totalValue: res.data.totalValue,
          advancePayment: res.data.advancePayment,
          balancePayment: res.data.balancePayment,
        });
        setInvoice((prevInvoice) => {
          const updatedInvoice = [...prevInvoice];
          updatedInvoice[selectedIndex] = {
            ...selectedBill,
            totalValue: res.data.totalValue,
            advancePayment: res.data.advancePayment,
            balancePayment: res.data.balancePayment,
          };
          return updatedInvoice;
        });
        setReceiveAmountData({
          ...receiveAmountData,
          amount: "",
        });
        getReceiveAmountHistory(selectedEstimateId);
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error(error);
    }
  };

  useEffect(() => {
    getReceiveAmountHistory(selectedEstimateId);
  }, [selectedEstimateId]);

  useEffect(() => {
    getAllInvoice();
  }, []);

  return (
    <AdminLayout showOnlyTable={showOnlyTable || showOnlyModelTable}>
      {!showOnlyModelTable && (
        <div className="admin-users-container ">
          {/* Only show the header, filters, and tools if not in table-only mode */}
          {!showOnlyTable && (
            <>
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
              <div className="tools">
                <div className="form-fields">
                  <input
                    className="mb-2 py-2"
                    type="search"
                    name="search"
                    placeholder="Search by ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="form-fields">
                  <input
                    className="mb-2 py-2"
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
                <div className="form-fields mb-4">
                  <select
                    name="balancePayment"
                    value={selectBalance}
                    onChange={(e) => setSelectBalance(e.target.value)}
                  >
                    <option value="">Filter Balance Payment</option>
                    <option value="yes">Yes</option>
                  </select>
                  <button
                    className="bb-btn ms-2 m-0"
                    onClick={handleClearFilter}
                  >
                    Clear Filter
                  </button>
                </div>
                <div className="action-buttons">
                  <button
                    className="b-btn "
                    onClick={() => {
                      setShowOnlyTable(true);
                      const originalTitle = document.title;

                      setTimeout(() => {
                        document.title = "Estimate Details"; // Set desired name
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
            </>
          )}

          <table
            className={`table user-table ${showOnlyTable ? "expanded" : ""}`}
          >
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Matter Name</th>
                <th>Billing to</th>
                <th>Mob No.</th>
                <th>Total Value</th>
                <th>Adv Payment</th>
                <th>Bal Payment</th>
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
                      <small>{item?.estimateId}</small>
                    </td>
                    <td>
                      <small>{item?.billingTo?.matterName}</small>
                    </td>
                    <td>
                      <small>{item?.billingTo?.name}</small>
                    </td>
                    <td>
                      <small>{item?.billingTo?.mobile}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.totalValue)}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.advancePayment)}</small>
                    </td>
                    <td>
                      <small>{formatNumber(item?.balancePayment)}</small>
                    </td>
                    <td>
                      <small>{item?.status}</small>
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
                    {!showOnlyTable && (
                      <td>
                        <div className="d-flex gap-2">
                          <PaymentIcon
                            style={{ cursor: "pointer" }}
                            onClick={() => showModal(item, index)}
                            className="text-primary"
                          />
                          <Link
                            target="_blank"
                            to={`/admin-print-estimate/${item?.estimateId}`}
                          >
                            <PrintIcon className="icon text-success" />
                          </Link>
                          <EditIcon
                            onClick={() =>
                              navigate(
                                `/admin-edit-estimate/${item?.estimateId}`
                              )
                            }
                          />
                          <DeleteIcon
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDelete(item?.estimateId)}
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
        </div>
      )}
      {/* Modal for Showing Bill Details */}
      <Modal
        title={`Details for Bill ${selectedBill?.estimateId || ""}`}
        open={isModalOpen}
        onOk={handleModalOK}
        onCancel={handleModalClose}
        centered
        width={700} // Wider layout for better content fit
      >
        {selectedBill ? (
          <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            {/* Bill Details Section */}
            <section
              style={{
                marginBottom: "20px",
                fontSize: "1.3em",
                width: "50%",
              }}
            >
              {[
                {
                  label: "Total Value",
                  value: selectedBill.totalValue,
                  color: "#1677ff",
                },
                {
                  label: "Advance Payment",
                  value: selectedBill.advancePayment,
                  color: "#52c41a",
                },
                {
                  label: "Balance Payment",
                  value: selectedBill.balancePayment,
                  color: "#ff4d4f",
                },
              ].map((item, index) => (
                <p
                  key={index}
                  style={{
                    margin: "8px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <strong>{item.label}:</strong>
                  <span style={{ color: item.color, fontWeight: "bold" }}>
                    {formatNumber(item.value)}
                  </span>
                </p>
              ))}
            </section>

            <hr style={{ margin: "20px 0", border: "1px solid #e0e0e0" }} />

            {/* Add Amount Section */}
            {!showOnlyModelTable && (
              <>
                <h4
                  style={{
                    marginBottom: "10px",
                    fontWeight: "600",
                    color: "#333",
                    fontSize: "1.2em",
                  }}
                >
                  Add Amount
                </h4>
                <form
                  onSubmit={(e) =>
                    handleReceiveAmountDataSubmit(e, selectedEstimateId)
                  }
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    style={{
                      padding: "10px",
                      flex: 2,
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                    }}
                    value={receiveAmountData.amount}
                    onChange={(e) =>
                      setReceiveAmountData({
                        ...receiveAmountData,
                        amount: e.target.value,
                      })
                    }
                    placeholder="Enter Amount"
                  />
                  <select
                    name=""
                    id=""
                    style={{
                      padding: "10px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      flex: 1,
                    }}
                    value={receiveAmountData.paymentMethod}
                    onChange={(e) =>
                      setReceiveAmountData({
                        ...receiveAmountData,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Payment Method</option>
                    <option value="cash">Cash</option>
                    <option value="phonepe">Phone Pe</option>
                    <option value="paytm">Paytm</option>
                    <option value="gpay">Gpay</option>
                    <option value="online">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    style={{
                      padding: "10px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      flex: 1,
                    }}
                    value={receiveAmountData.paymentDate}
                    onChange={(e) =>
                      setReceiveAmountData({
                        ...receiveAmountData,
                        paymentDate: e.target.value,
                      })
                    }
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#1677ff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </button>
                </form>
              </>
            )}

            <hr style={{ margin: "20px 0", border: "1px solid #e0e0e0" }} />

            {/* Payment History Section */}
            <h4
              style={{
                marginBottom: "10px",
                fontWeight: "600",
                color: "#333",
                fontSize: "1.2em",
              }}
            >
              Payment History
            </h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                fontSize: "0.9em",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Amount Received
                  </th>
                  <th
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Payment Method
                  </th>
                  <th
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Date
                  </th>
                  {!showOnlyModelTable && (
                  <th
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Action
                  </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {billHistory &&
                  billHistory?.map((bill, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: "10px",
                          border: "1px solid #e0e0e0",
                          color: "#555",
                        }}
                      >
                        {bill.paymentAmount}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          border: "1px solid #e0e0e0",
                          color: "#555",
                        }}
                      >
                        {bill.paymentMethod}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          border: "1px solid #e0e0e0",
                          color: "#555",
                        }}
                      >
                        {/* {bill?.paymentDate?.toDateString()?.substring(4)} */}
                        {new Date(bill.paymentDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                        {/* dd-mm-yyyy */}
                      </td>
                      {!showOnlyModelTable && (
                      <td
                        style={{
                          padding: "10px",
                          border: "1px solid #e0e0e0",
                          color: "#555",
                        }}
                      >
                        <DeleteIcon
                            style={{ cursor: "pointer" }}
                            onClick={() => {}}
                            className="text-danger"
                          />
                      </td>
                    )}
                    </tr>
                  ))}
              </tbody>
            </table>
            {!showOnlyModelTable && (
              <button
                className="b-btn my-4"
                onClick={() => {
                  setShowOnlyModelTable(true);
                  const originalTitle = document.title;

                  setTimeout(() => {
                    document.title = "Estimate Details"; // Set desired name
                    window.print();
                    document.title = originalTitle; // Restore original title
                    setShowOnlyModelTable(false); // Revert back to original view
                  }, 0); // Delay by a few milliseconds
                }}
              >
                Print All
              </button>
            )}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No details available
          </p>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminEstimate;
