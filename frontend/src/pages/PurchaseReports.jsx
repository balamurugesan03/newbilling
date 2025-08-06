import React, { useState, useEffect } from 'react';
import { 
  Card, 
  DatePicker, 
  Button, 
  Table, 
  Statistic, 
  Row, 
  Col, 
  Tabs, 
  message,
  Space,
  Typography,
  Tag
} from 'antd';
import { 
  FileTextOutlined, 
  CalendarOutlined, 
  ShoppingCartOutlined,
  DollarOutlined,
  BarChartOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const PurchaseReports = () => {
  const [loading, setLoading] = useState(false);
  const [dailyReport, setDailyReport] = useState(null);
  const [rangeReport, setRangeReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // Fetch daily report
  const fetchDailyReport = async (date) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/purchases/report/daily`, {
        params: { date: date.format('YYYY-MM-DD') }
      });
      setDailyReport(response.data);
    } catch (error) {
      message.error('Failed to fetch daily purchase report');
      console.error('Daily report error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch range report
  const fetchRangeReport = async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/purchases/report/range`, {
        params: { 
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      });
      setRangeReport(response.data);
    } catch (error) {
      message.error('Failed to fetch range purchase report');
      console.error('Range report error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly report
  const fetchMonthlyReport = async (month) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/purchases/report/monthly`, {
        params: { 
          month: month.month() + 1,
          year: month.year()
        }
      });
      setMonthlyReport(response.data);
    } catch (error) {
      message.error('Failed to fetch monthly purchase report');
      console.error('Monthly report error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial reports
  useEffect(() => {
    fetchDailyReport(selectedDate);
    fetchRangeReport(dateRange[0], dateRange[1]);
    fetchMonthlyReport(selectedMonth);
  }, []);

  // Download Excel report
  const downloadExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Table columns for purchases
  const purchaseColumns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type || 'N/A'}</Tag>
    },
    {
      title: 'Purchase Price',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      render: (price) => `₹${price?.toFixed(2) || '0.00'}`
    },
    {
      title: 'Sale Price',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (price) => `₹${price?.toFixed(2) || '0.00'}`
    },
    {
      title: 'Stock',
      dataIndex: 'openingStock',
      key: 'openingStock',
    },
    {
      title: 'Value',
      key: 'value',
      render: (_, record) => `₹${((record.purchasePrice || 0) * (record.openingStock || 0)).toFixed(2)}`
    },
    {
      title: 'GST Rate',
      dataIndex: 'gstRate',
      key: 'gstRate',
      render: (rate) => `${rate || 0}%`
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    }
  ];

  // Daily Report Tab
  const DailyReportTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Space>
            <Text strong>Select Date:</Text>
            <DatePicker 
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                fetchDailyReport(date);
              }}
            />
            <Button 
              type="primary" 
              icon={<CalendarOutlined />}
              onClick={() => fetchDailyReport(selectedDate)}
            >
              Generate Report
            </Button>
          </Space>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          {dailyReport && (
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => downloadExcel(dailyReport.purchases, `Daily_Purchase_Report_${selectedDate.format('YYYY-MM-DD')}`)}
            >
              Download Excel
            </Button>
          )}
        </Col>
      </Row>

      {dailyReport && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Purchases"
                  value={dailyReport.totals.totalPurchases}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Value"
                  value={dailyReport.totals.totalPurchaseValue}
                  prefix={<DollarOutlined />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Stock"
                  value={dailyReport.totals.totalStock}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Avg Purchase Price"
                  value={dailyReport.totals.avgPurchasePrice}
                  prefix="₹"
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          <Card title={`Purchase Details - ${selectedDate.format('DD/MM/YYYY')}`}>
            <Table
              columns={purchaseColumns}
              dataSource={dailyReport.purchases}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </Card>

          {Object.keys(dailyReport.categoryStats).length > 0 && (
            <Card title="Category Breakdown" style={{ marginTop: 20 }}>
              <Row gutter={16}>
                {Object.entries(dailyReport.categoryStats).map(([category, stats]) => (
                  <Col span={8} key={category}>
                    <Card size="small">
                      <Title level={5}>{category}</Title>
                      <p>Items: {stats.count}</p>
                      <p>Value: ₹{stats.totalValue.toFixed(2)}</p>
                      <p>Stock: {stats.totalStock}</p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </>
      )}
    </div>
  );

  // Range Report Tab
  const RangeReportTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Space>
            <Text strong>Select Date Range:</Text>
            <RangePicker 
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                if (dates && dates[0] && dates[1]) {
                  fetchRangeReport(dates[0], dates[1]);
                }
              }}
            />
          </Space>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          {rangeReport && (
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => downloadExcel(rangeReport.allPurchases, `Purchase_Report_${dateRange[0].format('YYYY-MM-DD')}_to_${dateRange[1].format('YYYY-MM-DD')}`)}
            >
              Download Excel
            </Button>
          )}
        </Col>
      </Row>

      {rangeReport && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Purchases"
                  value={rangeReport.overallTotals.totalPurchases}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Value"
                  value={rangeReport.overallTotals.totalPurchaseValue}
                  prefix={<DollarOutlined />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Stock"
                  value={rangeReport.overallTotals.totalStock}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Daily Breakdown">
            <Table
              columns={[
                { title: 'Date', dataIndex: 'date', key: 'date' },
                { title: 'Purchases', dataIndex: 'count', key: 'count' },
                { title: 'Total Value', dataIndex: 'totalValue', key: 'totalValue', render: (val) => `₹${val.toFixed(2)}` },
                { title: 'Total Stock', dataIndex: 'totalStock', key: 'totalStock' }
              ]}
              dataSource={rangeReport.dailyReport}
              rowKey="date"
              pagination={{ pageSize: 10 }}
            />
          </Card>

          <Card title="All Purchases" style={{ marginTop: 20 }}>
            <Table
              columns={purchaseColumns}
              dataSource={rangeReport.allPurchases}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </Card>
        </>
      )}
    </div>
  );

  // Monthly Report Tab
  const MonthlyReportTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Space>
            <Text strong>Select Month:</Text>
            <DatePicker.MonthPicker 
              value={selectedMonth}
              onChange={(month) => {
                setSelectedMonth(month);
                fetchMonthlyReport(month);
              }}
            />
          </Space>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          {monthlyReport && (
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => downloadExcel(monthlyReport.purchases, `Monthly_Purchase_Report_${selectedMonth.format('YYYY-MM')}`)}
            >
              Download Excel
            </Button>
          )}
        </Col>
      </Row>

      {monthlyReport && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Purchases"
                  value={monthlyReport.monthlyTotals.totalPurchases}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Value"
                  value={monthlyReport.monthlyTotals.totalPurchaseValue}
                  prefix={<DollarOutlined />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Stock"
                  value={monthlyReport.monthlyTotals.totalStock}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card title={`Monthly Summary - ${selectedMonth.format('MMMM YYYY')}`}>
            <Table
              columns={purchaseColumns}
              dataSource={monthlyReport.purchases}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </Card>
        </>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <FileTextOutlined /> Purchase Reports
      </Title>
      
      <Tabs defaultActiveKey="daily" type="card">
        <TabPane tab="Daily Report" key="daily">
          <DailyReportTab />
        </TabPane>
        <TabPane tab="Date Range" key="range">
          <RangeReportTab />
        </TabPane>
        <TabPane tab="Monthly Report" key="monthly">
          <MonthlyReportTab />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PurchaseReports;