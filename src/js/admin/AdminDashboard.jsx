import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { Chart as ChartJS } from "chart.js/auto";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dash, setDash] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [estimates, setEstimate] = useState(null);
  const [quotations, setQuotation] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [billsData, setBillsData] = useState(null);

  const getAdminDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/admin-dashboard", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setDash(res.data.data);
        setInvoices(res.data.data.invoices.reverse());
        setEstimate(res.data.data.estimates.reverse());
        setQuotation(res.data.data.quotations.reverse());
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  async function getAllInvoice() {
    try {
      const res = await axios.get("/api/invoice/get-all-invoice");
      if (res.data.success) {
        setInvoice(res.data.data.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAllInvoice();
    getAdminDashboard();
  }, []);

  const populateChartData = () => {
    if (invoice) {
      const salesData = Array(12).fill(0);
      const gstData = Array(12).fill(0);

      invoice.forEach((item) => {
        const month = new Date(item.createdAt).getMonth(); // Get the month index (0 to 11)
        salesData[month] += parseFloat(item.totalTaxableValue);
        gstData[month] +=
          parseFloat(item.totalCgst) + parseFloat(item.totalSgst);
      });

      const profitData = salesData.map(
        (sales, index) => sales - gstData[index]
      );

      return {
        salesData,
        gstData,
        profitData,
      };
    }

    return {
      salesData: [],
      gstData: [],
      profitData: [],
    };
  };

  const { salesData, gstData, profitData } = populateChartData();

  useEffect(() => {
    if (invoices && estimates && quotations) {
      const totalInvoice = invoices.length;
      const totalEstimates = estimates.length;
      const totalQuotations = quotations.length;
      setBillsData({
        labels: ["Invoice", "Estimate", "Quotation"],
        datasets: [
          {
            label: "Bills",
            data: [totalInvoice, totalEstimates, totalQuotations],
            backgroundColor: ["#00024c", "#19a9e6", "#ffca00"],
          },
        ],
      });
    }
  }, [invoices, estimates, quotations]);

  return (
    <AdminLayout>
      <div className="page-title">
        <h3 className="m-0">Dashboard</h3>
      </div>
      <hr />
      <div className="admin-dashboard-container p-0">
        <div
          className="dash-card text-white"
          onClick={() => navigate("/admin-products")}
        >
          <div className="count">
            <h1 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{dash?.productCount || 0}</b>
              )}
            </h1>
            <span>Products</span>
          </div>
          <ProductionQuantityLimitsIcon className="icon" />
        </div>
        <div
          className="dash-card text-white"
          onClick={() => navigate("/admin-estimate")}
        >
          <div className="count">
            <h1 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{dash?.estimateCount || 0}</b>
              )}
            </h1>
            <span>Estimate Bills</span>
          </div>
          <ReceiptLongIcon className="icon" />
        </div>
        <div
          className="dash-card text-white"
          onClick={() => navigate("/admin-quotation")}
        >
          <div className="count">
            <h1 className="m-0">
              {loading ? (
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <b>{dash?.quotationCount || 0}</b>
              )}
            </h1>
            <span>Quotation</span>
          </div>
          <ReceiptIcon className="icon" />
        </div>
        <div
          className="dash-card text-white"
          onClick={() => navigate("/admin-invoice")}
        >
          <div className="count">
            <h1 className="m-0">
              <h1 className="m-0">
                {loading ? (
                  <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <b>{dash?.invoiceCount || 0}</b>
                )}
              </h1>
            </h1>
            <span className="title">GST Bills</span>
          </div>
          <ReceiptLongIcon className="icon" />
        </div>
      </div>

      <div className="chart-container">
        <div className="chartOne">
          <h4>Total Sales</h4>
          <div className="hr-line"></div>
          <Bar
            data={{
              labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              datasets: [
                {
                  label: "Total Sales",
                  data: salesData,
                  backgroundColor: "#00024c",
                },
                {
                  label: "Profit",
                  data: profitData,
                  backgroundColor: "#19a9e6",
                },
                {
                  label: "Total GST",
                  data: gstData,
                  backgroundColor: "#ffca00",
                },
              ],
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
        <div className="chartTwo">
          <h4>Total Bills</h4>
          <div className="hr-line"></div>
          <Doughnut data={billsData || { labels: [], datasets: [] }} />
        </div>
      </div>

      <div className="admin-recent-things">
        {/* ========== */}
        <div className="recent-orders">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Recent Invoices</h5>
            <button
              onClick={() => navigate("/admin-invoice")}
              className="b-btn py-2"
            >
              View All
            </button>
          </div>
          <hr />
          <table className="table ">
            <thead>
              <tr>
                <th>Invoice Id</th>
                <th>Products</th>
                <th>Billing To</th>
                <th>Total Taxable Value</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices
                ?.map((item, index) => {
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
                        <small>{item?.totalTaxableValue}</small>
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
                    </tr>
                  );
                })
                .slice(0, 5)}
            </tbody>
          </table>
        </div>
        {/* ========== */}
        <div className="recent-orders">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Recent Quotation Bill</h5>
            <button
              onClick={() => navigate("/admin-quotation")}
              className="b-btn py-2"
            >
              View All
            </button>
          </div>
          <hr />
          <table className="table ">
            <thead>
              <tr>
                <th>Quotation Id</th>
                <th>Products</th>
                <th>Billing To</th>
                <th>Total Taxable Value</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {quotations
                ?.map((item, index) => {
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
                        <small>{item?.totalValue}</small>
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
                    </tr>
                  );
                })
                .slice(0, 5)}
            </tbody>
          </table>
        </div>{" "}
        {/* ========== */}
        <div className="recent-orders">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Recent Estimate Bill</h5>
            <button
              onClick={() => navigate("/admin-estimate")}
              className="b-btn py-2"
            >
              View All
            </button>
          </div>
          <hr />
          <table className="table ">
            <thead>
              <tr>
                <th>Quotation Id</th>
                <th>Products</th>
                <th>Billing To</th>
                <th>Total Taxable Value</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {estimates
                ?.map((item, index) => {
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
                        <small>{item?.totalValue}</small>
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
                    </tr>
                  );
                })
                .slice(0, 5)}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
