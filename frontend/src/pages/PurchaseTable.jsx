import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Row,
  Col
} from 'antd';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const PurchaseTable = () => {
  const [purchases, setPurchases] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/purchases`);
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch purchases.');
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleAddOrUpdate = async (values) => {
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/purchases/${editingId}`, values);
        message.success('Purchase updated!');
      } else {
        await axios.post(`${API_BASE_URL}/api/purchases/add`, values);
        message.success('Purchase added!');
      }
      form.resetFields();
      setOpen(false);
      setEditingId(null);
      fetchPurchases();
    } catch (err) {
      console.error(err);
      message.error('Error saving data.');
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingId(record.id); // ✅ Using MySQL id
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/purchases/${id}`);
      message.success('Purchase deleted!');
      fetchPurchases();
    } catch (err) {
      console.error(err);
      message.error('Error deleting data.');
    }
  };

  const columns = [
    { title: 'Product Name', dataIndex: 'productName' },
    { title: 'Item Code', dataIndex: 'itemCode' },
    { title: 'Brand', dataIndex: 'brand' },
    { title: 'Unit', dataIndex: 'unit' },
    { title: 'Opening Stock', dataIndex: 'openingStock' },
    { title: 'Purchase Price', dataIndex: 'purchasePrice' },
    { title: 'Sale Price', dataIndex: 'salePrice' },
    { title: 'GST (%)', dataIndex: 'gstRate' },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm title="Confirm delete?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Purchase List</h2>
      <Button
        type="primary"
        onClick={() => {
          form.resetFields();
          setEditingId(null);
          setOpen(true);
        }}
        style={{ marginBottom: 16 }}
      >
        + Add Purchase
      </Button>

      <Table
        dataSource={purchases}
        columns={columns}
        rowKey="id" // ✅ Use MySQL's auto-increment ID
        bordered
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingId ? 'Edit Purchase' : 'Add New Purchase'}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingId(null);
        }}
        footer={null}
        width={1000}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="group" label="Group">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brand" label="Brand">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="itemCode" label="Item Code">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="productName"
                label="Product Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="Unit">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="openingStock" label="Opening Stock">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="openingStockValue" label="Opening Stock Value">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="purchasePrice" label="Purchase Price">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="salePrice" label="Sale Price">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minSalePrice" label="Min Sale Price">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="mrp" label="M.R.P.">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="hsnSac" label="HSN/SAC">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gstRate" label="GST Rate (%)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="saleDiscount" label="Sale Discount (%)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="reorderLevel" label="Reorder Level">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="productionDate" label="Production Date">
                <Input type="date" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="expiryDate" label="Expiry Date">
                <Input type="date" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingId ? 'Update Purchase' : 'Save Purchase'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseTable;
