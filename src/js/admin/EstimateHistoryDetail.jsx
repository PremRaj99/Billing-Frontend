import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import AdminLayout from "./components/AdminLayout";

const EstimateHistoryDetail = () => {
  const { id } = useParams(); // Get the estimateId from the URL
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch history data
  const fetchHistory = async () => {
    setLoading(true); // Start loading indicator
    try {
      const res = await axios.get(`/api/estimate/get-history/${id}`);
      if (res.data.success) {
        setHistory(res.data.data || []);
      } else {
        message.error(res.data.message || "Failed to fetch history data.");
      }
    } catch (error) {
      console.error(error);
      message.error("An error occurred while fetching history.");
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [id]);

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">History for Estimate ID: {id}</h3>
          <button className="b-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
        <hr />
        {loading ? (
          <p>Loading history...</p>
        ) : history.length > 0 ? (
          <div className="table-containerr">
            <table className="table user-table">
              <thead>
                <tr>
                  <th>Change ID</th>
                  <th>Modified By</th>
                  <th>Change Type</th>
                  <th>Change Details</th>
                  <th>Date Modified</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <small>{item.changeId || "N/A"}</small>
                    </td>
                    <td>
                      <small>{item.modifiedBy || "Unknown"}</small>
                    </td>
                    <td>
                      <small>{item.changeType || "N/A"}</small>
                    </td>
                    <td>
                      <small>{item.changeDetails || "N/A"}</small>
                    </td>
                    <td>
                      <small>
                        {item.modifiedAt
                          ? new Date(item.modifiedAt).toLocaleString("default", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No history available for this estimate.</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default EstimateHistoryDetail;
