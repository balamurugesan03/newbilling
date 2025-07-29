import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Typography, Row, Col, Spin } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import './DashboardPage.css'; // Add this line

const { Title } = Typography;

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/today");
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Spin fullscreen />;

  const chartData = Object.entries(data.productSales).map(([name, stats]) => ({
    name,
    total: stats.total,
  }));

  return (
    <div className="dashboard-container">
      <Title level={2} className="dashboard-title">Today's Sales Overview</Title>

     <Row gutter={[16, 16]} className="summary-row">
  <Col xs={24} sm={24} md={8}>
    <Card className="summary-card total-card" title="Total Sales (with GST)">
      ₹{data.totalSales.toFixed(2)}
    </Card>
  </Col>
  <Col xs={24} sm={24} md={8}>
    <Card className="summary-card avg-card" title="Total Sales (without GST)">
      ₹{data.totalWithoutGST.toFixed(2)}
    </Card>
  </Col>
  <Col xs={24} sm={24} md={8}>
    <Card className="summary-card gst-card" title="Total GST Collected">
      ₹{data.totalGST.toFixed(2)}
    </Card>
  </Col>
</Row>


      <Card className="chart-card" title="Product-wise Sales">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
