import { useEffect, useState, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  message,
  Card,
  Switch,
  Modal,
} from "antd";
import { SaveOutlined, PrinterOutlined } from "@ant-design/icons";
import "./BillingPage.css";

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const [customerName, setCustomerName] = useState("");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [heldBills, setHeldBills] = useState([]);
  const [printData, setPrintData] = useState(null);
  const barcodeInputRef = useRef(null);
  let lastEnterTime = useRef(0);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      message.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSubmitBill();
      }
      if (e.key === "Escape") {
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, receivedAmount, paymentMode, customerName]);

  const reduceProductStock = async (productId, quantitySold) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/products/reduce-stock`, {
        productId,
        quantitySold,
      });
      console.log(`Stock updated for ${productId}: Remaining = ${res.data.remainingStock}`);
    } catch (err) {
      message.error(
        err.response?.data?.error || `Failed to reduce stock for product ID: ${productId}`
      );
    }
  };

  const handleAddItem = (values) => {
    const product = products.find((p) => p.id === values.productId);
    const quantity = values.quantity;

    if (!product) {
      message.error("Invalid product selected");
      return;
    }

    if (quantity > product.stockCount) {
      message.warning(`Only ${product.stockCount} in stock. Reduce quantity.`);
      return;
    }

    const unitPrice = Number(product.unitPrice);
    const gstPercent = Number(product.gstPercent);
    const gstAmount = product.gstApplicable ? (unitPrice * quantity * gstPercent) / 100 : 0;
    const total = unitPrice * quantity + gstAmount;

    const itemWithKey = {
      ...product,
      unitPrice,
      gstPercent,
      quantity,
      gstAmount,
      total,
      key: `${product.id}-${Date.now()}-${Math.random()}`,
    };

    setItems([...items, itemWithKey]);
    form.resetFields(["productId", "quantity"]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalGST = items.reduce((sum, item) => sum + item.gstAmount, 0);
  const totalAmount = subtotal + totalGST;
  const balanceAmount = totalAmount - receivedAmount;

  const handleSubmitBill = async () => {
    if (items.length === 0) {
      message.error("Add at least one item");
      return;
    }

    const values = await form.getFieldsValue();
    const isCredit = values.isCredit || false;

    const payload = {
      customerName: customerName || "Walk-in",
      items: items.map((i) => ({
        productId: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        gstPercent: i.gstPercent,
        gstApplicable: i.gstApplicable,
        gstAmount: i.gstAmount,
        total: i.total,
      })),
      subtotal,
      totalGST,
      totalAmount,
      receivedAmount,
      balanceAmount,
      isCredit,
      isPaid: !isCredit && balanceAmount <= 0,
      date: new Date(),
      paymentMode,
    };

    try {
      await axios.post(`${API_BASE_URL}/api/bills`, payload);
      message.success("Bill saved!");

      for (const item of items) {
        await reduceProductStock(item.id, item.quantity);
      }

      setPrintData(payload);
      handleReset();
      fetchProducts();
    } catch (err) {
      message.error("Failed to save bill");
    }
  };

  const handleReset = () => {
    setItems([]);
    setCustomerName("");
    setReceivedAmount(0);
    setPaymentMode("Cash");
    form.resetFields();
  };

  const handleHoldBill = () => {
    const currentBill = {
      customerName,
      items,
      receivedAmount,
      paymentMode,
    };

    setHeldBills([...heldBills, currentBill]);
    handleReset();
    message.success("Bill held successfully!");
  };

  return (
    <div className="billing-page-container">
      <Card title="Create Bill" style={{ marginBottom: 24 }}>
        <Form layout="vertical">
          <Form.Item label="Customer Name">
            <Input
              placeholder="Optional"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ width: 300 }}
            />
          </Form.Item>

          <Form.Item label="Scan Barcode or Product Code">
            <Input
              ref={barcodeInputRef}
              placeholder="Scan or type barcode"
              onPressEnter={(e) => {
                const code = e.target.value.trim();
                const product = products.find(
                  (p) => p.barcode === code || p.code === code
                );
                if (!product) {
                  message.error("Product not found");
                  return;
                }
                if (product.stockCount <= 0) {
                  message.warning("Out of stock");
                  return;
                }
                const quantity = 1;
                const unitPrice = Number(product.unitPrice);
                const gstPercent = Number(product.gstPercent);
                const gstAmount = product.gstApplicable
                  ? (unitPrice * quantity * gstPercent) / 100
                  : 0;
                const total = unitPrice * quantity + gstAmount;
                const itemWithKey = {
                  ...product,
                  unitPrice,
                  gstPercent,
                  quantity,
                  gstAmount,
                  total,
                  key: `${product.id}-${Date.now()}-${Math.random()}`,
                };
                setItems((prev) => [...prev, itemWithKey]);
                e.target.value = "";
              }}
              style={{ width: 300 }}
            />
          </Form.Item>

          {heldBills.length > 0 && (
            <Form.Item label="Resume Held Bill">
              <Select
                placeholder="Select held bill"
                style={{ width: 300 }}
                onChange={(index) => {
                  const held = heldBills[index];
                  setCustomerName(held.customerName);
                  setItems(held.items);
                  setReceivedAmount(held.receivedAmount);
                  setPaymentMode(held.paymentMode);
                  const newHeldBills = [...heldBills];
                  newHeldBills.splice(index, 1);
                  setHeldBills(newHeldBills);
                  message.info("Resumed held bill");
                }}
              >
                {heldBills.map((bill, index) => (
                  <Select.Option key={index} value={index}>
                    {bill.customerName || "Walk-in"} – {bill.items.length} items
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>

        <Form form={form} layout="inline" onFinish={handleAddItem}>
          <Form.Item
            name="productId"
            label="Product"
            rules={[{ required: true, message: "Select a product" }]}
          >
            <Select
              placeholder="Select product"
              style={{ width: 240 }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stockCount})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Qty"
            rules={[{ required: true, message: "Enter quantity" }]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item label="Is Credit Bill?" name="isCredit" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Add Item</Button>
          </Form.Item>

          <Form.Item>
            <Button
              style={{ backgroundColor: "#fadb14", color: "#000" }}
              onClick={handleHoldBill}
            >
              Hold
            </Button>
          </Form.Item>
        </Form>

        <Table
          className="billing-table"
          dataSource={items}
          rowKey="key"
          style={{ marginTop: 16 }}
          pagination={false}
          columns={[
            { title: "Product", dataIndex: "name" },
            { title: "Qty", dataIndex: "quantity" },
            {
              title: "Unit Price",
              dataIndex: "unitPrice",
              render: (text) => `₹${Number(text).toFixed(2)}`,
            },
            {
              title: "GST ₹",
              dataIndex: "gstAmount",
              render: (text) => `₹${Number(text).toFixed(2)}`,
            },
            {
              title: "Total ₹",
              dataIndex: "total",
              render: (text) => `₹${Number(text).toFixed(2)}`,
            },
          ]}
        />

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <p>Subtotal: ₹{!isNaN(subtotal) ? subtotal.toFixed(2) : "0.00"}</p>
          <p>Total GST: ₹{!isNaN(totalGST) ? totalGST.toFixed(2) : "0.00"}</p>
          <h3>Total Amount: ₹{!isNaN(totalAmount) ? totalAmount.toFixed(2) : "0.00"}</h3>

          <Form layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item label="Payment Mode">
              <Select
                value={paymentMode}
                onChange={(value) => setPaymentMode(value)}
                style={{ width: 200 }}
              >
                <Select.Option value="Cash">Cash</Select.Option>
                <Select.Option value="Paytm">Paytm</Select.Option>
                <Select.Option value="credit">Credit</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Received Amount (₹)">
              <InputNumber
                min={0}
                value={receivedAmount}
                onChange={(val) => setReceivedAmount(val || 0)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const now = Date.now();
                    if (now - lastEnterTime.current < 500) {
                      handleSubmitBill();
                    }
                    lastEnterTime.current = now;
                  }
                }}
                style={{ width: 200 }}
              />
            </Form.Item>
            <p>
              <b>Balance:</b> ₹{!isNaN(balanceAmount) ? balanceAmount.toFixed(2) : "0.00"}
            </p>
          </Form>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmitBill}
              style={{ marginTop: 8 }}
            >
              Save Bill
            </Button>
            <Button
              icon={<PrinterOutlined />}
              style={{ marginTop: 8 }}
              onClick={() => {
                if (!printData) return message.info("No bill to print");
                window.print();
              }}
            >
              Print
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
