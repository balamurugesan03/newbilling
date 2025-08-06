// src/pages/RegisterStaff.jsx
import { Form, Input, Button, Typography, message } from "antd";
import axios from "axios";
import API_BASE_URL from "../config/api";

const { Title } = Typography;

export default function RegisterStaff() {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, values);
      message.success("Staff registered successfully!");
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "50px auto",
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 0 12px rgba(0,0,0,0.1)",
      }}
    >
      <Title level={3}>Register New Staff</Title>
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please enter username" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter password" }]}
        >
          <Input.Password />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Register
        </Button>
      </Form>
    </div>
  );
}
