import React from 'react';
import authService from '../services/authService';

/**
 * A wrapper component that conditionally renders its children
 * if the current user has the required permission.
 * 
 * @param {string} permission - The permission string to check (e.g., "Products.Create")
 * @param {ReactNode} fallback - Optional component to render if permission is denied
 */
const RequirePermission = ({ permission, children, fallback = null }) => {
    // Check if the user has the required permission
    const isAuthorized = authService.hasPermission(permission);

    // Render children if authorized, fallback otherwise
    return isAuthorized ? <>{children}</> : fallback;
};

export default RequirePermission;
