import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import axios from "axios";
import { message } from "antd";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./AdminAddInvoice.css";
import { formatNumber } from "../components/numberUtils";

const AdminPrintInvoice = () => {
  const pdfRef = useRef();
  const params = useParams();
  const [quantities, setQuantities] = useState({});
  const [invoiceId, setInvoiceId] = useState(null);
  const [invoice, setInvoice] = useState({
    createdAt: new Date().toISOString().substr(0, 10),
  });
  const [billingTo, setBillingTo] = useState("");
  const [totalTaxableValue, setTotalTaxableValue] = useState(0);
  const [totalCGST, setTotalCGST] = useState(0);
  const [totalSGST, setTotalSGST] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [data, setData] = useState([]);

  async function getInvoiceById() {
    try {
      const res = await axios.post("/api/invoice/get-invoice-by-id", {
        invoiceId: params?.invoiceId,
      });
      if (res.data.success) {
        setData(res.data.data.products);
        setBillingTo(res.data.data.billingTo);
        setInvoice(res.data.data.invoice);
        setInvoiceId(res.data.data.invoiceId);
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
    setTotalCGST(cgst);
    setTotalSGST(sgst);
    setGrandTotal(taxableValue + cgst + sgst);
  }, [data, quantities]);

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
        pdf.save(`${params?.invoiceId}`);
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
      <div ref={pdfRef} className="preview-container">
        <div className="invoice-container preview">
          <div className="invoice-img"></div>
          {/* Billing Details */}
          <div className="bill-to-details">
            <div className="center mb-3">
              <h4 className="m-0 me-2">Billing To</h4>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="" className="me-3">
                Name
              </label>
              <h5 className="m-0 text-start w-100">{billingTo?.name}</h5>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="" className="me-3">
                Address
              </label>
              <h5 className="m-0 text-start w-100">{billingTo?.address}</h5>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="" className="me-3">
                GST
              </label>
              <h5 className="m-0 text-start w-100">{billingTo?.userGst}</h5>
            </div>
          </div>

          {/* Invoice Details  */}
          <div className="invoice-details">
            <div className="form-fields mb-3 center">
              <label htmlFor="">Invoice No</label>
              <h5 className="m-0 text-start w-100">{invoiceId}</h5>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="" className="me-3">
                Date
              </label>
              <h5 className="m-0 text-start w-100">{formattedDate}</h5>
            </div>
            <div className="form-fields mb-3 center">
              <label htmlFor="" className="me-3">
                Mobile
              </label>
              <h5 className="m-0 text-start w-100">{billingTo?.mobile}</h5>
            </div>
          </div>
          <div className="product-details">
            <table className="table table-bordered tb">
              <thead>
                <tr>
                  <th>
                    <small>Sr No</small>
                  </th>
                  <th>
                    <small>Product Details</small>
                  </th>
                  <th>
                    <small>Hsn Code</small>
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
                    <small>Taxable Value</small>
                  </th>
                  <th>
                    <small>CGST Rate</small>
                  </th>
                  <th>
                    <small>CGST Value</small>
                  </th>
                  <th>
                    <small>SGST Rate</small>
                  </th>
                  <th>
                    <small>SGST Value</small>
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
                        <td>{item?.hsnCode}</td>
                        <td>
                          {item?.length} x {item?.breadth}
                        </td>
                        <td>
                          <span>{quantities[index] || 0}</span>
                        </td>
                        <td>{sqft}</td>
                        <td>{item?.price}</td>
                        <td>{formatNumber(sqft * item?.price)}</td>
                        <td>{item?.cgst}%</td>
                        <td>
                          {formatNumber(
                            (sqft * item?.price * item?.cgst) / 100
                          )}
                        </td>
                        <td>{item?.sgst}%</td>
                        <td>
                          {formatNumber(
                            (sqft * item?.price * item?.sgst) / 100
                          )}
                        </td>
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
                  <div className="bg-danger text-white p-2">
                    <span>Bank Details:</span>
                  </div>
                  <p className="mt-2 m-0">
                    <b>Bank of India</b>
                  </p>
                  <p className="m-0">
                    <b>A/C No: 469920110000164</b>
                  </p>
                  <p className="m-0">
                    <b>IFSC Code: BKID0004699</b>
                  </p>
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
                        <td>Taxable Value</td>
                        <td>{formatNumber(totalTaxableValue)}</td>
                      </tr>
                      <tr>
                        <td>Total CGST</td>
                        <td>{formatNumber(totalCGST)}</td>
                      </tr>
                      <tr>
                        <td>Total SGST</td>
                        <td>{formatNumber(totalSGST)}</td>
                      </tr>
                      <tr>
                        <td>Grand Total</td>
                        <td>{formatNumber(grandTotal)}</td>
                      </tr>
                    </thead>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="address-container w-100">
            <div className="address justify-content-end">
              <p className="m-0 text-center">
                <b>Azim Art Point</b>
                <br />
                <br />
                <br />
                <br />
                <b>Authorized Signature</b>
              </p>
            </div>
            <div className="add-img"></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPrintInvoice;
