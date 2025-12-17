import React, { useContext, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode; // Components that should be rendered if access is allowed
  role?: string;       // Optional: specify a role to restrict access to certain users
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, token } = useContext(AuthContext);

  // If the user is not logged in (no token), redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and the user's role does not match, redirect to home
  if (role && user && user.primaryRole !== role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the child components
  return <>{children}</>;
};

export default PrivateRoute;
