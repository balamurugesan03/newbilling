import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", values);
      login(res.data.token);
      message.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      message.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxHeight: 600,
        maxWidth: 300,
        margin: "100px auto",
        padding: 30,
        borderRadius: 16,
        background: "rgba(16, 15, 15, 0.1)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        color: "white",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      }}
    >
      <Title level={3} style={{ color: "white",textAlign:"center"}}>Login</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="username"
          label={<span style={{ color: "white" }}>Username</span>}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label={<span style={{ color: "white" }}>Password</span>}
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Login
        </Button>
      </Form>
    </div>
  );
}
