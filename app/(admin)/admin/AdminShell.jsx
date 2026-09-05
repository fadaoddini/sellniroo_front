
"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Admin/Sidebar/Sidebar";
import AdminHeader from "@/components/Admin/AdminHeader/AdminHeader";
import styles from "./admin.module.css";

export default function AdminShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className={styles.adminLayout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <div
        className={`${styles.adminMain} ${
          sidebarCollapsed ? styles.expanded : ""
        }`}
      >
        <AdminHeader />

        <main className={styles.adminContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
