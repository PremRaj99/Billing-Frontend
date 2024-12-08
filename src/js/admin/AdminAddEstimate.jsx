import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import axios from "axios";
import CancelIcon from "@mui/icons-material/Cancel";
import { message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatNumber } from "../components/numberUtils";
import "./AdminAddInvoice.css";
import DeleteIcon from "@mui/icons-material/Delete";
import { AddBoxRounded } from "@mui/icons-material";

const AdminAddEstimate = () => {
  const navigate = useNavigate();
  const pdfRef = useRef();

  const [previewMode, setPreviewMode] = useState(false);
  const [products, setProducts] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  //!
  const [quantities, setQuantities] = useState({});
  const [invoiceId, setInvoiceId] = useState(null);
  const [invoice, setInvoice] = useState({
    createdAt: new Date().toISOString().substr(0, 10),
  });
  const [billingTo, setBillingTo] = useState("");
  const [advancePayment, setAdvancePayment] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("phonepe");
  const [discount, setDiscount] = useState(0);
  //! TOTAL
  const [totalTaxableValue, setTotalTaxableValue] = useState(0);
  const [balancePayment, setBalancePayment] = useState();
  const [totalCGST, setTotalCGST] = useState(0);
  const [totalSGST, setTotalSGST] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [data, setData] = useState([]);
  // new code
  const [name, setName] = useState("");
  const [nameOptions, setNameOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (name) {
      const options = customers?.filter((c) =>
        c.name.toLowerCase().includes(name.toLowerCase())
      );

      setNameOptions(options || []);
    } else {
      setNameOptions([]); // Clear options if name is empty
    }
  }, [name, customers]);

  const [productName, setProductName] = useState("");
  const [productNameOptions, setProductNameOptions] = useState([]);

  useEffect(() => {
    if (productName) {
      const options = products?.filter((c) =>
        c.name.toLowerCase().includes(productName.toLowerCase())
      );
      // console.log(options)

      setProductNameOptions(options || []);
    } else {
      setProductNameOptions([]); // Clear options if name is empty
    }
  }, [productName, products]);

  useEffect(() => {
    setBalancePayment(totalTaxableValue - advancePayment - discount);
  }, [totalTaxableValue, discount, advancePayment]);

  function handleCharge(e, value) {
    if (value === "advance") {
      setAdvancePayment(e.target.value);
      setBalancePayment(totalTaxableValue - e.target.value);
    }
    if (value === "discount") {
      setDiscount(e.target.value);
      setBalancePayment(totalTaxableValue - advancePayment - e.target.value);
    }
    if (value === "paymentMethod") {
      setPaymentMethod(e.target.value);
    }
  }

  function handleInputChange(e, index, fieldName) {
    const { value } = e.target;
    setData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        [fieldName]: value,
      };
      return newData;
    });
  }

  function handleQuantityChange(e, hsnCode) {
    const { value } = e.target;
    const quantityValue = value.trim() !== "" ? parseInt(value) : 0; // Parse value to integer if not empty, otherwise set to zero

    setData((prevData) => {
      const index = prevData.findIndex((item, index) => index === hsnCode);
      if (index !== -1) {
        const newData = [...prevData];
        newData[index] = {
          ...newData[index],
          quantity: quantityValue, // Set the quantity value
        };
        return newData;
      } else {
        return prevData;
      }
    });
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [hsnCode]: quantityValue, // Set the quantity value
    }));
  }

  function addManualProduct() {
    const newProduct = {
      matterName: "",
      breadth: "",
      length: "",
      name: "",
      price: "",
      quantity: 1,
    };
    setData((prevData) => [...prevData, newProduct]);
  }

  function handleInvoiceChange(e) {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  }

  function handleBillingChange(e) {
    setBillingTo({ ...billingTo, [e.target.name]: e.target.value });
  }

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(null);
    } else {
      const filtered = products.filter((product) => {
        return product?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredUsers(filtered);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, products]);

  const getAllProducts = async () => {
    try {
      const res = await axios.get("/api/product/get-all-products");
      if (res.data.success) {
        setProducts(res.data.data.reverse());
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllCustomers = async () => {
    try {
      const res = await axios.get("/api/admin/get-all-clients");
      if (res.data.success) {
        setCustomers(res.data.data.reverse());
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProducts();
    getAllCustomers();
  }, []);

  const filterProduct = filteredUsers || products;

  function addProduct(product) {
    message.success("Product Added");
    setData((prevData) => {
      const existingProductIndex = prevData.findIndex(
        (item, index) => index === product.index
      );
      if (existingProductIndex !== -1) {
        const newData = [...prevData];
        newData[existingProductIndex].quantity += 1;
        return newData;
      } else {
        return [...prevData, { ...product, quantity: 1 }];
      }
    });
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [product.index]: (prevQuantities[product.index] || 0) + 1,
    }));
  }

  function removeProduct(product) {
    setData((prevData) => {
      const existingProductIndex = prevData.findIndex(
        (item) => item.hsnCode === product.hsnCode
      );
      if (existingProductIndex !== -1) {
        // If the product exists, decrement its quantity
        const newData = [...prevData];
        if (newData[existingProductIndex].quantity > 1) {
          newData[existingProductIndex].quantity -= 1;
        } else {
          // If the quantity becomes 0, remove the product from data
          newData.splice(existingProductIndex, 1);
        }
        return newData;
      } else {
        // If the product doesn't exist, return the current data
        return prevData;
      }
    });

    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [product.hsnCode]: Math.max(
        (prevQuantities[product.hsnCode] || 0) - 1,
        0
      ),
    }));
  }

  //! Add invoice to db
  async function handleAddEstimate(status) {
    setLoading(true);
    try {
      const estimateObject = {
        estimateId: invoiceId,
        invoice: invoice,
        billingTo: billingTo,
        totalValue: totalTaxableValue,
        grandTotal: grandTotal,
        products: data,
        advancePayment: advancePayment,
        discount: discount,
        balancePayment: balancePayment,
        status: status,
        paymentMethod: paymentMethod,
      };
      const res = await axios.post(
        "/api/estimate/add-estimate",
        estimateObject
      );
      if (res.data.success) {
        navigate("/admin-estimate");
        message.success(res.data.message);
        setLoading(false);
      } else {
        message.error(res.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

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
        pdf.save(`${invoiceId}`);
      });
    } else {
      console.error("PDF reference is not available.");
    }
  }

  const dateObject = new Date(invoice?.createdAt);
  const day = dateObject.getDate();
  const month = dateObject.toLocaleString("default", { month: "long" });
  const year = dateObject.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  return (
    <AdminLayout>
      {/* PRODUCT LIST POPUP  */}
      {showProducts && (
        <div className="product-list-container">
          <div className="table-containerr">
            <div className="tools d-flex justify-content-between">
              <div className="form-fields">
                <input
                  className="mb-4 py-2"
                  type="search"
                  name="search"
                  placeholder="Search by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <CancelIcon
                  className="icon"
                  onClick={() => setShowProducts(!showProducts)}
                />
              </div>
            </div>
            <table className="table user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Hsn Code</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filterProduct?.map((product, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <small>{product?.name}</small>
                      </td>
                      <td>
                        <small>{product?.hsnCode}</small>
                      </td>
                      <td>
                        <small>{product?.price}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => addProduct(product)}
                            className="btn btn-success"
                          >
                            Add
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCustomers && (
        <div className="product-list-container">
          <div className="table-containerr">
            <div className="tools d-flex justify-content-between">
              <div className="form-fields">
                <input
                  className="mb-4 py-2"
                  type="search"
                  name="search"
                  placeholder="Search by name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div>
                <CancelIcon
                  className="icon"
                  onClick={() => setShowCustomers(!showCustomers)}
                />
              </div>
            </div>
            <table className="table user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers?.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <small>{item?.name}</small>
                      </td>
                      <td>
                        <small>{item?.mobile}</small>
                      </td>
                      <td>
                        <small>{item?.address}</small>
                      </td>
                      <td>
                        <button
                          className="btn btn-success"
                          onClick={() => {
                            setBillingTo(item);
                            setShowCustomers(!showCustomers);
                          }}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVOICE && NON PREVIEW MODE  */}
      {previewMode ? (
        <>
          <div ref={pdfRef} className="preview-container">
            <div className="invoice-container preview">
              <div className="invoice-img estimate-img"></div>
              {/* Billing Details */}
              <div className="bill-to-details">
                <div className="center mb-3">
                  <h5 className="m-0 me-2">Billing To</h5>
                </div>
                <div className="form-fields mb-3 center">
                  <label htmlFor="" className="me-3">
                    Name
                  </label>
                  <h5 className="text-start w-100 m-0">{billingTo?.name}</h5>
                </div>
                <div className="form-fields mb-3 center">
                  <label htmlFor="" className="me-3">
                    Address
                  </label>
                  <h5 className="text-start w-100 m-0">{billingTo?.address}</h5>
                </div>
                <div className="form-fields mb-4 center">
                  <label htmlFor="" className="me-3">
                    Matter Name
                  </label>
                  <h5 className="text-start w-100 m-0">
                    {billingTo?.matterName}
                  </h5>
                </div>
              </div>

              {/* Invoice Details  */}
              <div className="invoice-details">
                <div className="form-fields mb-3 center">
                  <label htmlFor="" className="me-3">
                    Date
                  </label>
                  <h5 className="text-start w-100 m-0">{formattedDate}</h5>
                </div>

                <div className="form-fields mb-3 center">
                  <label htmlFor="" className="me-3">
                    Mobile
                  </label>
                  <h5 className="text-start w-100 m-0">{billingTo?.mobile}</h5>
                </div>
              </div>
              <div className="product-details est">
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
                        <small>Total</small>
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
                      <p>
                        All disputes subject to HAZARIBAG Jusrisdiction only.
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
                            <td>Total Value</td>
                            <td>{formatNumber(totalTaxableValue)}</td>
                          </tr>
                          <tr>
                            <td>Advance Payment</td>
                            <td>{formatNumber(advancePayment)}</td>
                          </tr>
                          <tr>
                            <td>Rounding Off</td>
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
          <button
            className="b-btn me-2 mt-4"
            onClick={() => setPreviewMode(!previewMode)}
          >
            Back to Editing Mode
          </button>
          {/* <button onClick={downloadPdf} className="b-btn">
            Download PDF
          </button> */}
        </>
      ) : (
        <>
          <div className="admin-users-container">
            <div className="page-title">
              <h3 className="m-0">New Estimate</h3>
            </div>
            <hr />
            <div className="add-invoice-container">
              <button
                className="b-btn py-2"
                onClick={() => navigate("/admin-estimate")}
              >
                Back
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="b-btn ms-2"
              >
                Preview Mode
              </button>
            </div>
          </div>
          <div className="invoice-container">
            <div className="invoice-img estimate-img"></div>
            {/* Billing Details */}
            <div className="bill-to-details">
              <div className="center mb-3">
                <h5 className="m-0 me-2">Billing To</h5>
                <button
                  onClick={() => setShowCustomers(!showCustomers)}
                  className="p-1 b-btn"
                >
                  Add Existing Customer
                </button>
              </div>
              <div className="form-fields mb-3 center">
                <label htmlFor="" className="me-3">
                  Name
                </label>
                <input
                  type="text"
                  list="nameOptionsList"
                  className="form-control"
                  name="name"
                  placeholder="Enter name"
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setName(selectedName);

                    // Find the selected customer based on the name
                    const selectedCustomer = nameOptions.find(
                      (option) => option.name === selectedName
                    );

                    // Update billingTo with the selected customer's details if found
                    if (selectedCustomer) {
                      setBillingTo({
                        ...billingTo,
                        name: selectedCustomer.name,
                        address: selectedCustomer.address,
                        mobile: selectedCustomer.mobile,
                        matterName: selectedCustomer.matterName || "",
                      });
                    } else {
                      // If no match, just update the name
                      setBillingTo({ ...billingTo, name: selectedName });
                    }
                  }}
                  value={billingTo?.name || ""}
                />
                {/* Dynamically generated datalist */}
                <datalist id="nameOptionsList">
                  {nameOptions.map((option, index) => (
                    <option key={index} value={option.name} />
                  ))}
                </datalist>
              </div>
              <div className="form-fields mb-3 center">
                <label htmlFor="" className="me-3">
                  Address
                </label>
                {/* <input
                  type="text"
                  className="form-control"
                  name="address"
                  placeholder="Enter address"
                  onChange={handleBillingChange}
                  value={nameOptions[0]?.address || billingTo?.address}
                /> */}
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  placeholder="Enter address"
                  onChange={handleBillingChange}
                  value={billingTo?.address || ""}
                />
              </div>
              <div className="form-fields mb-4 center">
                <label htmlFor="" className="me-3">
                  Matter Name
                </label>
                {/* <input
                  type="text"
                  className="form-control"
                  name="matterName"
                  placeholder="Enter matter name"
                  onChange={handleBillingChange}
                  value={nameOptions[0]?.matterName || billingTo?.matterName}
                /> */}
                <input
                  type="text"
                  className="form-control"
                  name="matterName"
                  placeholder="Enter matter name"
                  onChange={handleBillingChange}
                  value={billingTo?.matterName || ""}
                />
              </div>
            </div>

            {/* Invoice Details  */}
            <div className="invoice-details">
              <div className="form-fields mb-3 center">
                <label htmlFor="" className="me-3">
                  Date
                </label>
                <input
                  onChange={handleInvoiceChange}
                  value={invoice?.createdAt}
                  name="createdAt"
                  type="date"
                  className="form-control"
                />
              </div>
              <div className="form-fields mb-3 center">
                <label htmlFor="" className="me-3">
                  Mobile
                </label>
                {/* <input
                  type="text"
                  className="form-control"
                  name="mobile"
                  placeholder="Enter mobile"
                  onChange={handleBillingChange}
                  value={nameOptions[0]?.mobile || billingTo?.mobile}
                /> */}
                <input
                  type="text"
                  className="form-control"
                  name="mobile"
                  placeholder="Enter mobile"
                  onChange={handleBillingChange}
                  value={billingTo?.mobile || ""}
                />
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
                      <small>Total</small>
                    </th>
                    <th>
                      <small>Action</small>
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
                          <td width={100}>{index + 1}</td>
                          <td>
                            <div className="form-fields">
                              <input
                                value={item?.name}
                                type="text"
                                list="productOptionsList"
                                className="form-control"
                                onChange={(e) => {
                                  const selectedProductName = e.target.value;
                                  setProductName(selectedProductName);

                                  const selectedProduct =
                                    productNameOptions.find(
                                      (option) =>
                                        option.name === selectedProductName
                                    );

                                  // Update the specific item's name and price if a match is found
                                  if (selectedProduct) {
                                    const updatedData = [...data];
                                    updatedData[index] = {
                                      ...updatedData[index],
                                      name: selectedProduct.name,
                                      price: selectedProduct.price,
                                    };
                                    setData(updatedData);
                                  } else {
                                    // Allow user to manually input a name without selecting from the list
                                    const updatedData = [...data];
                                    updatedData[index] = {
                                      ...updatedData[index],
                                      name: selectedProductName,
                                    };
                                    setData(updatedData);
                                  }
                                }}
                              />
                              {/* Dynamically generated datalist */}
                              <datalist id="productOptionsList">
                                {productNameOptions.map((option, index) => (
                                  <option key={index} value={option.name} />
                                ))}
                              </datalist>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex form-fields">
                              <input
                                type="text"
                                className="w-50 form-control"
                                name="length"
                                placeholder="length"
                                value={item?.length}
                                onChange={(e) =>
                                  handleInputChange(e, index, "length")
                                }
                              />
                              <input
                                type="text"
                                className="w-50 form-control"
                                name="breadth"
                                placeholder="breadth"
                                value={item?.breadth}
                                onChange={(e) =>
                                  handleInputChange(e, index, "breadth")
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className="form-fields">
                              <input
                                type="text"
                                name="quantity"
                                value={quantities[index]}
                                onChange={(e) => handleQuantityChange(e, index)}
                              />
                            </div>
                          </td>
                          <td width={100}>
                            {formatNumber(
                              item?.length * item?.breadth * quantities[index]
                            )}
                          </td>
                          <td>
                            <div className="form-fields">
                              <input
                                name="price"
                                onChange={(e) =>
                                  handleInputChange(e, index, "price")
                                }
                                type="text"
                                value={item?.price}
                              />
                            </div>
                          </td>
                          <td>{formatNumber(sqft * item?.price)}</td>
                          <td style={{ display: "flex", border: "none" }}>
                            <DeleteIcon
                              className="text-danger"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                // remove index
                                setData(data.filter((_, i) => i !== index));
                              }}
                            />
                            <AddBoxRounded
                              style={{ cursor: "pointer", color: "#00185e" }}
                              onClick={() => {
                                // add new row
                                const newProduct = {
                                  breadth: "",
                                  length: "",
                                  name: "",
                                  price: "",
                                  quantity: "",
                                };
                                setData((data) => [
                                  ...data.slice(0, index + 1),
                                  newProduct,
                                  ...data.slice(index + 1),
                                ]);
                                // code generated by AI  //  update the quantity
                                setQuantities((prevQuantities) => {
                                  const entries =
                                    Object.entries(prevQuantities);

                                  // Insert the new value at the specific index
                                  const updatedEntries = [
                                    ...entries.slice(0, index + 1),
                                    [index + 1, ""], // Increment following keys
                                    ...entries.slice(index + 1),
                                  ];

                                  // Rebuild with adjusted integer keys
                                  const reIndexed = updatedEntries.map(
                                    ([key, val], idx) => [idx, val]
                                  );

                                  return Object.fromEntries(reIndexed);
                                });
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              <button className="b-btn py-2" onClick={addManualProduct}>
                Add Manual
              </button>
              <button
                onClick={() => setShowProducts(!showProducts)}
                className="b-btn py-2 ms-2 mt-2"
              >
                Add Product
              </button>

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
                          <td>
                            <div className="form-fields">
                              <input
                                value={advancePayment}
                                type="text"
                                className="form-control"
                                placeholder="Enter advance payment"
                                name="advancePayment"
                                onChange={(e) => handleCharge(e, "advance")}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Payment Mode</td>
                          <td>
                            <div className="form-fields">
                              <select
                                name="paymentMethod"
                                className="w-100"
                                value={paymentMethod}
                                onChange={(e) =>
                                  handleCharge(e, "paymentMethod")
                                }
                                id=""
                              >
                                <option value="cash">Cash</option>
                                <option value="phonepe">PhonePe</option>
                                <option value="paytm">Paytm</option>
                                <option value="gpay">GPay</option>
                                <option value="online">
                                  Bank Transfer
                                </option>
                                <option value="cheque">Cheque</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Rounding Off</td>
                          <td>
                            <div className="form-fields">
                              <input
                                value={discount}
                                name="discount"
                                type="text"
                                className="form-control"
                                placeholder="Enter discount"
                                // onChange={handleCharge}
                                onChange={(e) => handleCharge(e, "discount")}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Balance Payment</td>
                          <td>
                            <div className="form-fields">
                              <input
                                value={formatNumber(balancePayment)}
                                name="balancePayment"
                                type="text"
                                className="form-control"
                                placeholder="Enter balance payment"
                                readOnly
                              />
                            </div>
                          </td>
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
          <button
            disabled={balancePayment === 0 || loading}
            style={{ cursor: balancePayment === 0 ? "not-allowed" : "pointer" }}
            onClick={(e) => handleAddEstimate("unpaid")}
            className="mt-3 mx-2 b-btn py-2"
          >
            {loading ? (
              <>
                {" "}
                <Spin />
                "loading..."
              </>
            ) : (
              "Save Estimate as Unpaid"
            )}
          </button>

          <button
            disabled={loading}
            onClick={(e) => handleAddEstimate("paid")}
            className="mt-3 mx-2 b-btn py-2"
          >
            {loading ? (
              <>
                <Spin />
                "Adding Estimate..."
              </>
            ) : (
              "Save Estimate as Paid"
            )}
          </button>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminAddEstimate;
