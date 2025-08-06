import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { Card, Typography, Row, Col, Spin, Divider } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import './DashboardPage.css';

const { Title } = Typography;

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/today`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Spin fullscreen />;

  const chartData = Object.entries(data?.productSales || {}).map(
    ([name, stats]) => ({
      name,
      total: stats.total,
    })
  );

  return (
    <div className="dashboard-container">
      <Title level={2} className="dashboard-title">Today's Sales Overview</Title>

      {/* Today's Summary */}
      <Row gutter={[16, 16]} className="summary-row">
        <Col xs={24} sm={24} md={8}>
          <Card className="summary-card total-card" title="Total Sales (with GST)">
            ₹{(Number(data?.totalSales) || 0).toFixed(2)}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card className="summary-card avg-card" title="Total Sales (without GST)">
            ₹{(Number(data?.totalWithoutGST) || 0).toFixed(2)}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card className="summary-card gst-card" title="Total GST Collected">
            ₹{(Number(data?.totalGST) || 0).toFixed(2)}
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Monthly Summary */}
      <Title level={2} className="dashboard-title">Monthly Sales Overview</Title>
      <Row gutter={[16, 16]} className="summary-row">
        <Col xs={24} sm={24} md={8}>
          <Card className="summary-card total-card" title="Monthly Sales (with GST)">
            ₹{(Number(data?.monthlySales) || 0).toFixed(2)}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card className="summary-card avg-card" title="Monthly Sales (without GST)">
            ₹{(Number(data?.monthlyWithoutGST) || 0).toFixed(2)}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card className="summary-card gst-card" title="Monthly GST Collected">
            ₹{(Number(data?.monthlyGST) || 0).toFixed(2)}
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Product-wise Sales Chart */}
      {/* <Card className="chart-card" title="Product-wise Sales (Today)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card> */}
    </div>
  );
}
