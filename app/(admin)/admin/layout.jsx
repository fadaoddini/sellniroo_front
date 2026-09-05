
import AdminShell from "./AdminShell";

export const metadata = {
  title: "داشبورد",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
