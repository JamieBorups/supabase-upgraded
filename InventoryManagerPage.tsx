import React from 'react';

const DeprecatedInventoryManagerPage: React.FC = () => {
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 text-center">
            <i className="fa-solid fa-box-archive text-6xl text-slate-300"></i>
            <h1 className="text-3xl font-bold text-slate-900 mt-4">This Page is Deprecated</h1>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
                The Master Inventory is now managed within the unified <strong>Marketplace</strong> module. Please navigate to Marketplace from the main menu to access inventory features.
            </p>
        </div>
    );
};

export default DeprecatedInventoryManagerPage;
