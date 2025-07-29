import { useEffect, useState } from "react";
import axios from "axios";
import { Select, Card, Typography } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const { Option } = Select;
const { Title } = Typography;

export default function YearlyReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/yearly-report", {
        params: { year },
      });

      const months = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        totalAmount: 0,
        totalGST: 0,
        totalCost: 0,
        profit: 0,
      }));

      res.data.forEach((entry) => {
        const index = entry.month - 1;
        months[index].totalAmount = entry.totalAmount || 0;
        months[index].totalGST = entry.totalGST || 0;
        months[index].totalCost = entry.totalCost || 0;
        months[index].profit = entry.profit || 0;
      });

      setData(months);
    } catch (err) {
      console.error("Failed to fetch yearly data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  return (
    <div>
      <Title level={3}>Yearly Sales Report</Title>

      <Select
        value={year}
        onChange={setYear}
        style={{ width: 120, marginBottom: 24 }}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const y = new Date().getFullYear() - i;
          return (
            <Option key={y} value={y}>
              {y}
            </Option>
          );
        })}
      </Select>

      <Card>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalAmount" name="Sales Total" fill="#1890ff" />
            <Bar dataKey="totalGST" name="GST Collected" fill="#f5222d" />
            <Bar dataKey="totalCost" name="Total Cost" fill="#ffc107" />
            <Bar dataKey="profit" name="Profit" fill="#52c41a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
