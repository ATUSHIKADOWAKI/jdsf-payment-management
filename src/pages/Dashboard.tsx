import React from 'react'
import useUserRole from '../hooks/useUserRole';
import AdminDashboard from '../components/AdminDashboard';
import UserDashboard from '../components/UserDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { role, loading } = useUserRole();

    if (loading) return <p>Loading...</p>;

    if (role === "admin") {
        return <AdminDashboard />;
    } else if (role === "user") {
        return <UserDashboard />
    } else {
        return <Navigate to="/" />
    }
}

export default Dashboard