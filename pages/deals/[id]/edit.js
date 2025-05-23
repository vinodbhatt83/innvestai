// pages/deals/[id]/editNew.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import EditDealForm from '../../../components/deals/EditDealForm';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { AlertTriangle } from 'lucide-react'; // Import AlertTriangle

const EditDealPageNew = () => {
  const router = useRouter();
  const { id } = router.query;
  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchDealData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/deals/${id}/assumptions`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch deal assumptions' }));
          throw new Error(errorData.message || 'Failed to fetch deal assumptions');
        }
        const data = await response.json();
        setDealData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDealData();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Loading Deal for Editing...">
        <div className="flex flex-col justify-center items-center h-80"> {/* Increased height, flex-col */}
          <LoadingSpinner size="large" /> {/* Spinner already uses text-secondary */}
          <p className="ml-3 mt-4 text-neutral-600 text-lg">Loading deal data, please wait...</p> {/* Larger text, margin top */}
        </div>
      </Layout>
    );
  }

  if (error || !dealData) {
    return (
      <Layout title="Error Loading Deal">
        <div className="max-w-lg mx-auto mt-10 bg-red-50 p-6 rounded-lg shadow-md text-center"> {/* Centered text */}
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Could Not Load Deal Information</h2>
          <p className="text-red-600 mb-6">{error || 'The requested deal data could not be found or loaded correctly.'}</p>
          <button
            onClick={() => router.push('/deals')}
            className="inline-flex items-center px-6 py-2 border border-secondary text-secondary rounded-md shadow-sm text-sm font-medium hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors duration-150"
          >
            Return to Deals List
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Deal: ${dealData.deal_name || dealData.property_name || 'Untitled Deal'}`}> {/* Added property_name as fallback */}
      {/* Pass the whole dealData object which might include top-level deal info + assumptions */}
      <EditDealForm dealId={id} initialData={dealData} />
    </Layout>
  );
};

export default EditDealPageNew;
