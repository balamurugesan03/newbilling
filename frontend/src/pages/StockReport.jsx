import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const StockReport = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching stock report:', err);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'Product Name', dataIndex: 'name', key: 'name' },
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice' },
    { title: 'GST %', dataIndex: 'gstPercent', key: 'gstPercent' },
    {
      title: 'GST Applicable',
      dataIndex: 'gstApplicable',
      key: 'gstApplicable',
      render: val => (val ? "Yes" : "No"),
    },
    { title: 'Stock Remaining', dataIndex: 'stockCount', key: 'stockCount' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📦 Stock Report</Title>

      <Input
        placeholder="Search product..."
        style={{ width: 300, marginBottom: 16 }}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 5}}
      />
    </div>
  );
};

export default StockReport;
