import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/auth/Login";
import Forbidden from "./pages/common/Forbidden";

import OwnerDashboard from "./pages/owner/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";
import Settings from "./pages/owner/Settings";
import AuditLogs from "./pages/owner/AuditLogs";

import POS from "./pages/pos/POS";
import Orders from "./pages/orders/Orders";
import OrderDetails from "./pages/orders/OrderDetails";
import Tables from "./pages/tables/Tables";
import KitchenDisplay from "./pages/kitchen/KitchenDisplay";
import Menu from "./pages/menu/Menu";
import Inventory from "./pages/inventory/Inventory";
import Purchases from "./pages/purchases/Purchases";
import Suppliers from "./pages/purchases/Suppliers";
import Customers from "./pages/customers/Customers";
import Staff from "./pages/staff/Staff";
import Attendance from "./pages/staff/Attendance";
import Expenses from "./pages/expenses/Expenses";
import Payments from "./pages/payments/Payments";
import Reports from "./pages/reports/Reports";

const ROLE_HOME = {
  OWNER: "/owner/dashboard",
  MANAGER: "/manager/dashboard",
  CASHIER: "/cashier/pos",
  WAITER: "/waiter/orders",
  KITCHEN: "/kitchen",
};

function HomeRedirect() {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<RoleRoute allowed={["OWNER"]} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/settings" element={<Settings />} />
            <Route path="/owner/audit-logs" element={<AuditLogs />} />
          </Route>

          <Route element={<RoleRoute allowed={["MANAGER"]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          </Route>

          <Route element={<RoleRoute allowed={["OWNER", "MANAGER", "CASHIER", "WAITER"]} />}>
            <Route path="/pos" element={<POS />} />
            <Route path="/cashier/pos" element={<POS />} />
          </Route>

          <Route element={<RoleRoute allowed={["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"]} />}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/waiter/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/tables" element={<Tables />} />
          </Route>

          <Route element={<RoleRoute allowed={["OWNER", "MANAGER", "KITCHEN"]} />}>
            <Route path="/kitchen" element={<KitchenDisplay />} />
          </Route>

          <Route element={<RoleRoute allowed={["OWNER", "MANAGER"]} />}>
            <Route path="/menu" element={<Menu />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchases/suppliers" element={<Suppliers />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/attendance" element={<Attendance />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<RoleRoute allowed={["OWNER", "MANAGER", "CASHIER"]} />}>
            <Route path="/customers" element={<Customers />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/payments" element={<Payments />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
