import React from 'react';
import DealCreationForm from '../components/deals/DealCreationForm';
import Layout from '../components/Layout';

const CreateDealPage = () => {
  return (
    <Layout title="Create New Deal">
      <DealCreationForm />
    </Layout>
  );
};

export default CreateDealPage;