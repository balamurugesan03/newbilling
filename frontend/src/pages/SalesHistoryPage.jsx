import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import {
  DatePicker,
  Table,
  Card,
  Typography,
  Row,
  Col,
  message,
  Button,
} from "antd";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./SalesHistoryPage.css";

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function SalesHistoryPage() {
  const [bills, setBills] = useState([]);
  const [range, setRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);

  const location = useLocation();

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bill-history`, {
        params: {
          start: range[0]?.toISOString(),
          end: range[1]?.toISOString(),
        },
      });
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error("Failed to fetch bills");
    }
  };

  useEffect(() => {
    fetchBills();
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
    }
  }, [range, location.state?.reload]);

  const exportToExcel = () => {
    const data = bills.map((bill) => ({
      Date: dayjs(bill.created_at).format("DD/MM/YYYY hh:mm A"),
      Customer: bill.customer_name,
      Products: bill.items
        .map(
          (item) =>
            `${item.name || 'Unknown Product'} x ${item.quantity} = ₹${(
              item.total || 0
            ).toFixed(2)} (${item.gstPercent}% GST)`
        )
        .join("\n"),
      Subtotal: Number(bill.subtotal || 0).toFixed(2),
      GST: Number(bill.total_gst || 0).toFixed(2),
      Total: Number(bill.total_amount || 0).toFixed(2),
      Received: Number(bill.received_amount || 0).toFixed(2),
      PaymentMode: bill.payment_mode || "-",
      Balance: (
        (Number(bill.total_amount) || 0) - (Number(bill.received_amount) || 0)
      ).toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesHistory");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, `SalesHistory_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => dayjs(text).format("DD/MM/YYYY hh:mm A"),
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "Products",
      dataIndex: "items",
      key: "items",
      render: (items) =>
        (items || []).map((item, i) => (
          <div key={i}>
            {item.name || 'Unknown Product'} x {item.quantity} = ₹
            {(Number(item.total) || 0).toFixed(2)} ({item.gstPercent}% GST)
          </div>
        )),
    },
    {
      title: "SubTotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (val) => <>₹{(Number(val) || 0).toFixed(2)}</>,
    },
    {
      title: "GST",
      dataIndex: "total_gst",
      key: "total_gst",
      render: (val) => <>₹{(Number(val) || 0).toFixed(2)}</>,
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val) => <>₹{(Number(val) || 0).toFixed(2)}</>,
    },
    {
      title: "Received",
      dataIndex: "received_amount",
      key: "received_amount",
      render: (val) => <>₹{(Number(val) || 0).toFixed(2)}</>,
    },
    {
      title: "Payment Mode",
      dataIndex: "payment_mode",
      key: "payment_mode",
      render: (val) => val || "-",
    },
    {
      title: "Balance",
      key: "balance_amount",
      render: (_, record) => {
        const balance =
          (Number(record.total_amount) || 0) - (Number(record.received_amount) || 0);
        return <>₹{balance.toFixed(2)}</>;
      },
    },
  ];

  const dailyTotal = bills.reduce(
    (acc, bill) => {
      acc.subtotal += Number(bill.subtotal) || 0;
      acc.gst += Number(bill.total_gst) || 0;
      acc.total += Number(bill.total_amount) || 0;
      acc.received += Number(bill.received_amount) || 0;
      return acc;
    },
    { subtotal: 0, gst: 0, total: 0, received: 0 }
  );

  const totalBalance = dailyTotal.total - dailyTotal.received;

  return (
    <div className="sales-history-container">
      <div
        className="header-row"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Sales History
        </Title>
        <Button type="primary" onClick={exportToExcel}>
          Export to Excel
        </Button>
      </div>

      <RangePicker
        style={{ marginBottom: 24 }}
        value={range}
        onChange={(dates) => setRange(dates)}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="summary-card purple">
            <Title level={5}>Total (without GST)</Title>
            <Title level={3}>₹{Number(dailyTotal.subtotal).toFixed(2)}</Title>
            <div className="summary-sub">From selected range</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="summary-card blue">
            <Title level={5}>Total GST Collected</Title>
            <Title level={3}>₹{Number(dailyTotal.gst).toFixed(2)}</Title>
            <div className="summary-sub">GST in range</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="summary-card green">
            <Title level={5}>Grand Total</Title>
            <Title level={3}>₹{Number(dailyTotal.total).toFixed(2)}</Title>
            <div className="summary-sub">Incl. GST</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="summary-card orange">
            <Title level={5}>Balance Amount</Title>
            <Title level={3}>₹{Number(totalBalance).toFixed(2)}</Title>
            <div className="summary-sub">Outstanding</div>
          </Card>
        </Col>
      </Row>

      <div style={{ overflowX: "auto" }}>
        <Table
          columns={columns}
          dataSource={bills}
          rowKey="id"
          pagination={{ pageSize: 4 }}
          scroll={{ x: "max-content" }}
          className="product-table"
        />
      </div>
    </div>
  );
}
