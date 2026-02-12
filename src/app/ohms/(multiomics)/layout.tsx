import OhmDetailsLayout from '@/common/components/OhmDetails/OhmDetailsLayout';
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <OhmDetailsLayout>
            {children}
        </OhmDetailsLayout>
    );
};

export default Layout;