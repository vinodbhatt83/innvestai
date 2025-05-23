// pages/deals/[id]/edit.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import EditDealForm from '../../../components/deals/EditDealForm';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const EditDealPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch when we have the ID
    if (!id) return;

  const fetchDealData = async () => {
      try {
        console.log(`Fetching deal data for ID: ${id}`);
        const response = await fetch(`/api/deals/${id}/assumptions`);
        
        if (!response.ok) {
          console.error(`API response not OK: ${response.status} ${response.statusText}`);
          // Try to get detailed error from response JSON if available
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || response.statusText || 'Failed to fetch deal data');
          } catch (jsonError) {
            throw new Error(`${response.status}: ${response.statusText || 'Failed to fetch deal data'}`);
          }
        }
        
        const data = await response.json();
        console.log('Deal data fetched successfully:', data);
        setDealData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching deal:', err);
        setError(err.message || 'An error occurred while fetching deal data');
        setLoading(false);
      }
    };

    fetchDealData();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <p className="ml-3 text-neutral-600">Loading deal data...</p>
        </div>
      </Layout>
    );
  }

  if (error || !dealData) {
    return (
      <Layout title="Error">
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <h2 className="text-red-800 font-medium">Error loading deal</h2>
          <p className="text-red-700">{error || 'Deal not found'}</p>
        </div>
        <button
          onClick={() => router.push('/deals')}
          className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
        >
          Return to Deals
        </button>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Deal: ${dealData.deal_name || 'Untitled Deal'}`}>
      <EditDealForm dealId={id} initialData={dealData} />
    </Layout>
  );
};

export default EditDealPage;
