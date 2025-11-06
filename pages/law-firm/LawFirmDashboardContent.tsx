
// This file is no longer used directly for the 'dashboard' view.
// The content is now served by pages/admin/AdminDashboardContent.tsx,
// which is rendered by pages/dashboards/LawFirmDashboard.tsx.

// Keeping the file to avoid breaking imports if it's referenced elsewhere,
// but its content is effectively deprecated in favor of the unified dashboard.

import React from 'react';

const LawFirmDashboardContent = (): React.ReactElement => {
    return (
        <div>
            <p>Please navigate to a different section.</p>
        </div>
    );
};

export default LawFirmDashboardContent;
