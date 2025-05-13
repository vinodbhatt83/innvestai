// pages/deals/create.js
import React from 'react';
import Layout from '../../components/Layout';
import DealCreationForm from '../../components/deals/DealCreationForm';

const CreateDealPage = () => {
  return (
    <Layout title="Create Deal">
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              Create New Deal
            </h2>
          </div>
        </div>
        
        <DealCreationForm />
      </div>
    </Layout>
  );
};

export default CreateDealPage;