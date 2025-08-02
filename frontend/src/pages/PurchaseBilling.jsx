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
        const res = await axios.get('http://localhost:5001/api/purchases');
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

  const handleSave = async () => {
    if (cartItems.length === 0) {
      return message.warning('Cart is empty');
    }

    try {
      // Save each cart item as a separate purchase record
      const savePromises = cartItems.map(async (item) => {
        const purchaseData = {
          type: 'General',
          group: 'Purchase',
          brand: supplierName || 'Unknown',
          itemCode: item.itemCode,
          productName: item.productName,
          unit: 'Unit',
          openingStock: item.quantity,
          openingStockValue: item.total,
          purchasePrice: item.rate,
          salePrice: item.rate * 1.2, // 20% markup
          minSalePrice: item.rate * 1.1, // 10% markup
          mrp: item.rate * 1.3, // 30% markup
          hsnSac: item.hsnSac || '',
          gstRate: 18, // Default GST rate
          saleDiscount: 0,
          reorderLevel: 10
        };

        return axios.post('http://localhost:5001/api/purchases/add', purchaseData);
      });

      await Promise.all(savePromises);
      message.success(`${cartItems.length} purchase records saved successfully!`);
      
      // Reset form
      setCartItems([]);
      setSupplierName('');
    } catch (err) {
      console.error(err);
      message.error('Error saving purchase records');
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
        <Button type="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default PurchaseBilling;
