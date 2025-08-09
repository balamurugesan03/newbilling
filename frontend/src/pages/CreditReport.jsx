import { useState, useEffect } from "react";
import { Table, Button, DatePicker, message } from "antd";
import axios from "axios";
import API_BASE_URL from "../config/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CreditReport() {
  const [bills, setBills] = useState([]);
  const [month, setMonth] = useState(dayjs());

  const fetchReport = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bills/credit-report`, {
        params: {
          month: month.month() + 1,
          year: month.year(),
        },
      });
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  const markPaid = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/bills/mark-paid/${id}`);
      message.success("Marked as paid");

      // Update only that record in state
      setBills(prevBills =>
        prevBills.map(bill =>
          bill.id === id ? { ...bill, is_paid: 1 } : bill
        )
      );
    } catch (err) {
      message.error("Error updating status");
    }
  };

  const downloadInvoice = async (record) => {
    const element = document.createElement("div");
    element.style.padding = "20px";
    element.style.backgroundColor = "white";
    element.style.width = "600px";
    element.innerHTML = `
      <h2 style="text-align:center;">INVOICE</h2>
      <hr/>
      <p><strong>Customer:</strong> ${record.customer_name}</p>
      <p><strong>Date:</strong> ${dayjs(record.date).format("DD/MM/YYYY")}</p>
       <p><strong>Total Name:</strong> ${record.customer_name}</p>
        <p><strong>Total Product:</strong> ${record.name}</p>
      <p><strong>Total Amount:</strong> ₹${record.total_amount}</p>
      <p><strong>Status:</strong> ${record.is_paid ? "Paid" : "Unpaid"}</p>
      <hr/>
      <p style="text-align:center;">Thank you for your business!</p>
    `;
    document.body.appendChild(element);

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10);
    pdf.save(`${record.customer_name}-invoice.pdf`);

    document.body.removeChild(element);
  };

  const columns = [
    { title: "Customer", dataIndex: "customer_name" },
    { title: "Date", dataIndex: "date", render: d => dayjs(d).format("DD/MM/YYYY") },
    { title: "Amount", dataIndex: "total_amount" },
    {
      title: "Status",
      render: (_, record) =>
        record.is_paid ? <span style={{ color: "green" }}>Paid</span> : <span style={{ color: "red" }}>Unpaid</span>,
    },
    {
      title: "Action",
      render: (_, record) =>
        record.is_paid ? null : (
          <Button type="link" onClick={() => markPaid(record.id)}>Mark Paid</Button>
        ),
    },
    {
      title: "Invoice",
      render: (_, record) => (
        <Button type="link" onClick={() => downloadInvoice(record)}>Download</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 16, maxWidth: "100%", boxSizing: "border-box" }}>
      <h2 style={{ marginBottom: 16, fontSize: "1.3rem" }}>Monthly Credit Report</h2>

      {/* Date Picker */}
      <div style={{ marginBottom: 16 }}>
        <DatePicker
          picker="month"
          value={month}
          onChange={(val) => setMonth(val)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <Table
          columns={columns}
          dataSource={bills}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          style={{ minWidth: "600px" }}
        />
      </div>
    </div>
  );
}
