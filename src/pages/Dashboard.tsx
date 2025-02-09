import React from "react";
import useUserRole from "../hooks/useUserRole";
import AppLayout from "../components/common/AppLayout";

const Dashboard = () => {
  const { loading } = useUserRole();
  if (loading) return <p>Loading...</p>;

  return <AppLayout />;
};

export default Dashboard;
