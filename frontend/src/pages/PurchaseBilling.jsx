import React, { useEffect, useState } from 'react';
import {
  Select,
  InputNumber,
  Button,
  Table,
  Form,
  message,
  Input,
  Typography,
} from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Option } = Select;
const { Title } = Typography;

const PurchaseBilling = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [supplierName, setSupplierName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/purchases');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        message.error('Failed to fetch products');
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (values) => {
    const selectedProduct = products.find(p => p.itemCode === values.itemCode);
    if (!selectedProduct) {
      return message.error('Product not found');
    }

    const existingIndex = cartItems.findIndex(p => p.itemCode === values.itemCode);
    const quantity = values.quantity;
    const discount = values.discount || 0;
    const rate = selectedProduct.purchasePrice;
    const total = quantity * rate - discount;

    if (existingIndex > -1) {
      const updatedItems = [...cartItems];
      updatedItems[existingIndex].quantity += quantity;
      updatedItems[existingIndex].total =
        updatedItems[existingIndex].quantity * rate - discount;
      setCartItems(updatedItems);
    } else {
      setCartItems([
        ...cartItems,
        {
          itemCode: selectedProduct.itemCode,
          productName: selectedProduct.productName,
          hsnSac: selectedProduct.hsnSac,
          rate: rate,
          quantity: quantity,
          discount: discount,
          total: total,
        },
      ]);
    }

    form.resetFields();
  };

  const handleSaveInvoice = async () => {
    if (!supplierName) {
      return message.warning('Please enter supplier name');
    }

    if (cartItems.length === 0) {
      return message.warning('Cart is empty');
    }

    const invoiceData = {
      invoiceNumber: `INV${Date.now()}`,
      supplierName,
      purchaseDate: new Date(),
      items: cartItems,
      totalAmount: cartItems.reduce((sum, item) => sum + item.total, 0),
    };

    try {
      // 1. Save to backend
      await axios.post('http://localhost:5000/api/invoices/add', invoiceData);
      message.success('Invoice saved!');

      // 2. Export to Excel
      const excelData = cartItems.map(item => ({
        'Product Name': item.productName,
        'HSN Code': item.hsnSac,
        Quantity: item.quantity,
        Rate: item.rate,
        Discount: item.discount,
        Total: item.total.toFixed(2),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Invoice');

      // Add total row
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [[``, ``, ``, ``, 'Grand Total', invoiceData.totalAmount.toFixed(2)]],
        { origin: -1 }
      );

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(file, `${invoiceData.invoiceNumber}.xlsx`);

      // 3. Reset
      setCartItems([]);
      setSupplierName('');
    } catch (err) {
      console.error(err);
      message.error('Error saving invoice');
    }
  };

  const columns = [
    { title: 'Item', dataIndex: 'productName' },
    { title: 'HSN', dataIndex: 'hsnSac' },
    { title: 'Qty', dataIndex: 'quantity' },
    { title: 'Rate', dataIndex: 'rate' },
    { title: 'Discount', dataIndex: 'discount' },
    { title: 'Total', dataIndex: 'total' },
  ];

  return (
    <div style={{ padding: 20, backgroundColor: '#1f1f1f', minHeight: '100vh' }}>
      <Title level={3} style={{ color: 'white' }}>🧾 Purchase Billing</Title>

      <Input
        placeholder="Supplier Name"
        value={supplierName}
        onChange={(e) => setSupplierName(e.target.value)}
        style={{ width: 300, marginBottom: 20 }}
      />

      <Form form={form} layout="inline" onFinish={handleAddToCart}>
        <Form.Item name="itemCode" rules={[{ required: true, message: 'Select item' }]}>
          <Select placeholder="Select Item" style={{ width: 200 }}>
            {products.map((product) => (
              <Option key={product.itemCode} value={product.itemCode}>
                {product.productName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="quantity" rules={[{ required: true, message: 'Enter quantity' }]}>
          <InputNumber placeholder="Qty" min={1} />
        </Form.Item>

        <Form.Item name="discount">
          <InputNumber placeholder="Discount" min={0} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">Add to Cart</Button>
        </Form.Item>
      </Form>

      <Table
        dataSource={cartItems}
        columns={columns}
        rowKey="itemCode"
        style={{ marginTop: 20 }}
        pagination={false}
        bordered
      />

      <div style={{ textAlign: 'right', marginTop: 20 }}>
        <Title level={4} style={{ color: 'white' }}>
          Grand Total: ₹{cartItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
        </Title>
        <Button type="primary" onClick={handleSaveInvoice}>
          Save Invoice & Download Excel
        </Button>
      </div>
    </div>
  );
};

export default PurchaseBilling;
