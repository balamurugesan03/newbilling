import React, { useEffect, useState } from 'react';
import { Menu, Drawer, Button } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserAddOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import './sidebar.css';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleResize = () => setIsMobile(window.innerWidth <= 900);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = (
    <Menu
      mode={isMobile ? 'vertical' : 'inline'}
      selectedKeys={[location.pathname]}
      className="sidebar-menu"
      onClick={() => isMobile && setDrawerVisible(false)} // Close on click
    >
      <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
        <Link to="/dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="/purchase" icon={<DashboardOutlined />}>
        <Link to="/purchase">Item Master</Link>
      </Menu.Item>
        <Menu.Item key="/purchase" icon={<DashboardOutlined />}>
        <Link to="/purchase-billing">Purchase bill</Link>
      </Menu.Item>
      <Menu.Item key="/product" icon={<ShoppingOutlined />}>
        <Link to="/product">Products</Link>
      </Menu.Item>
      <Menu.Item key="/billing" icon={<FileTextOutlined />}>
        <Link to="/billing"> sales Billing</Link>
      </Menu.Item>
      <Menu.Item key="/sales-history" icon={<HistoryOutlined />}>
        <Link to="/sales-history">Sales History</Link>
      </Menu.Item>
      <Menu.Item key="/yearly-report" icon={<BarChartOutlined />}>
        <Link to="/yearly-report">Yearly Report</Link>
      </Menu.Item>
      <Menu.Item key="/register-staff" icon={<UserAddOutlined />}>
        <Link to="/register-staff">Register</Link>
      </Menu.Item>
      <Menu.Item key="/credit-report" icon={<CreditCardOutlined />}>
        <Link to="/credit-report">Credit</Link>
      </Menu.Item>
      <Menu.Item key="/stock-report" icon={<CreditCardOutlined />}>
        <Link to="/stock-report">stock</Link>
      </Menu.Item>
      <Menu.Item key="/logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {/* Mobile Topbar */}
      {isMobile && (
        <div className="mobile-topbar">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ color: '#00ffb0', fontSize: '1.4rem' }}
          />
          <div className="logo-text-mobile">🧾 Billing</div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="sidebar-container">
          <div className="sidebar-logo">
            <span className="logo-icon">🧾</span>
            <span className="logo-text">Billing</span>
          </div>
          <div className="sidebar-menu-title">Main Menu</div>
          {menuItems}
        </div>
      )}

      {/* Mobile Drawer Sidebar */}
     <Drawer
  title={<span className="drawer-title">Billing Menu</span>}
  placement="left"
  closable
  onClose={() => setDrawerVisible(false)}
  open={drawerVisible}
  bodyStyle={{ padding: 0, background: '#0f2027' }}
  drawerStyle={{ background: '#0f2027' }}
  headerStyle={{ background: '#0f2027', borderBottom: '1px solid #2c5364' }}
>
  {menuItems}
</Drawer>

    </>
  );
}

export default Sidebar;
