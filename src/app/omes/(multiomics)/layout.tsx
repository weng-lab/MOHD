import OmeDetailsLayout from '@/common/components/OmeDetails/OmeDetailsLayout';
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <OmeDetailsLayout>
            {children}
        </OmeDetailsLayout>
    );
};

export default Layout;