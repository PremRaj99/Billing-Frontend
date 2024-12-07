import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import axios from "axios";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./AdminAddInvoice.css";
import { formatNumber } from "../components/numberUtils";

const AdminPrintEstimate = () => {
  const params = useParams();
  const pdfRef = useRef();
  const [quantities, setQuantities] = useState({});
  const [invoiceId, setInvoiceId] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [billingTo, setBillingTo] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [discount, setDiscount] = useState("");
  const [balancePayment, setBalancePayment] = useState("");
  const [totalTaxableValue, setTotalTaxableValue] = useState(0);
  const [data, setData] = useState([]);

  async function getInvoiceById() {
    try {
      const res = await axios.post("/api/estimate/get-estimate-by-id", {
        estimateId: params?.estimateId,
      });
      if (res.data.success) {
        setData(res.data.data.products);
        setBillingTo(res.data.data.billingTo);
        setInvoice(res.data.data.invoice);
        setInvoiceId(res.data.data.estimateId);
        setAdvancePayment(res.data.data.advancePayment);
        setDiscount(res.data.data.discount);
        setBalancePayment(res.data.data.balancePayment);
        const qty = {};
        res.data.data.products.forEach((product, index) => {
          const { quantity } = product;
          qty[index] = quantity;
        });
        setQuantities(qty);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getInvoiceById();
  }, []);

  // Calculate Total Taxable Value, CGST, SGST, and Grand Total
  useEffect(() => {
    let taxableValue = 0;
    let cgst = 0;
    let sgst = 0;
    data.forEach((item, index) => {
      const sqft = item.length * item.breadth * (quantities[index] || 0);
      const subtotal = sqft * item.price;
      const itemCGST = (subtotal * item.cgst) / 100;
      const itemSGST = (subtotal * item.sgst) / 100;
      taxableValue += subtotal;
      cgst += itemCGST;
      sgst += itemSGST;
    });
    setTotalTaxableValue(taxableValue);
  }, [data, quantities]);

  //! PDF
  function downloadPdf() {
    const input = pdfRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4", true);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio
        );
        pdf.save(`${params?.estimateId}`);
        window.close();
      });
    } else {
      console.error("PDF reference is not available.");
    }
  }

  setTimeout(() => {
    downloadPdf();
  }, 1000);

  const dateObject = new Date(invoice?.createdAt);
  const day = dateObject.getDate();
  const month = dateObject.toLocaleString("default", { month: "long" });
  const year = dateObject.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  return (
    <AdminLayout>
      <div className="preview-container" ref={pdfRef}>
        <div className="invoice-container preview">
          <div className="invoice-img estimate-img"></div>
          {/* Billing Details */}
          <div className="bill-to-details">
            <div className="center mb-3">
              <h4 className="m-0 me-2">Billing To</h4>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="">Name</label>
              <h5 className="w-100 text-start m-0">{billingTo?.name}</h5>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="">Address</label>
              <h5 className="w-100 text-start m-0">{billingTo?.address}</h5>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="">Matter Name</label>
                <h5 className="w-100 text-start m-0">{billingTo?.matterName}</h5>
            </div>
          </div>
          {/* Invoice Details  */}
          <div className="invoice-details">
            <div className="form-fields mb-3 center">
              <label htmlFor="">Invoice No</label>
              <h5 className="w-100 text-start m-0">{invoiceId}</h5>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="">Date</label>
              <h5 className="w-100 text-start m-0">{formattedDate}</h5>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="">Mobile</label>
              <h5 className="w-100 text-start m-0">{billingTo?.mobile}</h5>
            </div>
          </div>
          <div className="product-details est">
            <table className="table tb table-bordered">
              <thead>
                <tr>
                  <th>
                    <small>Sr No</small>
                  </th>
                  <th>
                    <small>Product Details</small>
                  </th>
                  <th>
                    <small>Size</small>
                  </th>
                  <th>
                    <small>Qty</small>
                  </th>
                  <th>
                    <small>Total Sqft</small>
                  </th>
                  <th>
                    <small>Rate</small>
                  </th>
                  <th>
                    <small>Total Value</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data?.map((item, index) => {
                    const sqft = formatNumber(
                      item?.length * item?.breadth * quantities[index]
                    );
                    return (
                      <tr>
                        <td>{index + 1}</td>
                        <td>{item?.name}</td>
                        <td>
                          {item?.length} x {item?.breadth}
                        </td>
                        <td>
                          <span>{quantities[index] || 0}</span>
                        </td>
                        <td>{sqft}</td>
                        <td>{item?.price}</td>
                        <td>{formatNumber(sqft * item?.price)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {/* Total  */}
            {data?.length > 0 && (
              <div className="row mt-5">
                <div className="col-8">
                  <div className="bg-danger text-white p-2">
                    <span>Terms & Conditions</span>
                  </div>
                  <p className="m-0 mt-3">
                    Goods Once Sold will not be taken back or exchanged.
                  </p>
                  <p>All disputes subject to HAZARIBAG Jusrisdiction only.</p>
                </div>
                <div className="col-4">
                  <table className="table tb table-bordered">
                    <thead>
                      <tr>
                        <td className="tbtotal" colSpan={100}>
                          <b>Total</b>
                        </td>
                      </tr>
                      <tr>
                        <td>Total Value</td>
                        <td>{formatNumber(totalTaxableValue)}</td>
                      </tr>
                      <tr>
                        <td>Advance Payment</td>
                        <td>{formatNumber(advancePayment)}</td>
                      </tr>
                      <tr>
                        <td>Discount</td>
                        <td>{formatNumber(discount)}</td>
                      </tr>
                      <tr>
                        <td>Balance Payment</td>
                        <td>{formatNumber(balancePayment)}</td>
                      </tr>
                    </thead>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="address-container w-100">
            <div className="address justify-content-end">
              <b>Authorized Signature</b>
            </div>
            <div className="add-img"></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPrintEstimate;
