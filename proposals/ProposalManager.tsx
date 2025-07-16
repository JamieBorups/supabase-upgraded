

import React from 'react';

const ProposalManager: React.FC = () => {
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 text-center">
            <i className="fa-solid fa-box-archive text-6xl text-slate-300"></i>
            <h1 className="text-3xl font-bold text-slate-900 mt-4">This Page is Deprecated</h1>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Proposal Snapshots are now managed within the unified <strong>Reporting & Archives</strong> page. Please navigate there from the main menu to access this feature.
            </p>
        </div>
    );
};

export default ProposalManager;