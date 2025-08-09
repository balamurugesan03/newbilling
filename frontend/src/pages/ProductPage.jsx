import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import {
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  Modal,
  message,
  DatePicker,
  Row,
  Col
} from "antd";
import './ProductPage.css';
import dayjs from "dayjs";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/products`);
    setProducts(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onFinish = async (values) => {
    try {
      // Format dates before sending to backend
      if (values.productionDate) {
        values.productionDate = values.productionDate.toISOString();
      }
      if (values.expiryDate) {
        values.expiryDate = values.expiryDate.toISOString();
      }

      if (editingProduct) {
        await axios.put(`${API_BASE_URL}/api/products/${editingProduct.id}`, values);
        message.success("Product updated");
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, values);
        message.success("Product added");
      }

      form.resetFields();
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      message.error("Error saving product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    form.setFieldsValue({
      ...product,
      productionDate: product.productionDate ? dayjs(product.productionDate) : null,
      expiryDate: product.expiryDate ? dayjs(product.expiryDate) : null,
    });

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_BASE_URL}/api/products/${id}`);
    message.success("Product deleted");
    fetchProducts();
  };

  return (
    <div className="product-page-container">
      <Button className="add-product-btn" type="primary" onClick={() => setIsModalOpen(true)}>
        Add Product
      </Button>

      <Table
        className="product-table"
        dataSource={products}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        scroll={{ x: 1000 }}
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Item Code", dataIndex: "itemCode" },
          { title: "HS Code", dataIndex: "hsCode" },
          { title: "Barcode", dataIndex: "barcode" },
          { title: "MRP", dataIndex: "mrp" },
          { title: "UNITPRICE", dataIndex: "unitPrice" },
          { title: "Purchase Rate", dataIndex: "purchaseRate" },
          { title: "GST %", dataIndex: "gstPercent" },
          {
            title: "GST?",
            dataIndex: "gstApplicable",
            render: (val) => (val ? "Yes" : "No")
          },
          { title: "Stock", dataIndex: "stockCount" },
          {
            title: "Actions",
            render: (_, record) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button onClick={() => handleEdit(record)} type="link">Edit</Button>
                <Button onClick={() => handleDelete(record.id)} type="link" danger>Delete</Button>
              </div>
            )
          }
        ]}
      />

      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        footer={null}
      >
       <Form className="product-form" form={form} layout="vertical" onFinish={onFinish}>
  <Row gutter={16}>
    <Col span={8}>
      <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="itemCode" label="Item Code" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="hsCode" label="HS Code">
        <Input />
      </Form.Item>
    </Col>

    <Col span={8}>
      <Form.Item name="barcode" label="Barcode">
        <Input />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="mrp" label="MRP" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="purchaseRate" label="Purchase Rate" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </Col>

    <Col span={8}>
      <Form.Item name="unitPrice" label="Unit Price" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="stockCount" label="Stock Count" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="gstPercent" label="GST (%)" rules={[{ required: true }]}>
        <InputNumber min={0} max={100} style={{ width: "100%" }} />
      </Form.Item>
    </Col>

    <Col span={8}>
      <Form.Item name="gstApplicable" label="GST Applicable" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Col>
      <Col span={8}><Form.Item name="saleDiscount" label="Sale Discount (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
  
  </Row>

  <Form.Item style={{ textAlign: "right" }}>
    <Button htmlType="submit" type="primary">
      {editingProduct ? "Update" : "Add"}
    </Button>
  </Form.Item>
</Form>

      </Modal>
    </div>
  );
}
