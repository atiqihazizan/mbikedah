import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, X, Check, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from '@tanstack/react-query';
import { formatDate, formatCurrency } from "../../config/format";
import { useStateContext } from "../../contexts/ContextProvider";
import { TButton, TLoadingSpinner, TSpinner } from "../Core";
import apiClient from "../../utils/axios";

function FinanceVerifyDialog({ showModal, billingId, onCloseModal, onVerificationComplete }) {
  const queryClient = useQueryClient();
  const { currentUser } = useStateContext();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [remarksError, setRemarksError] = useState('');

  const fetchBillingData = useCallback(async () => {
    if (!billingId || !showModal) return;
    
    try {
      setLoading(true);
      const {data} = await apiClient.post(`/status-validation/validate`, {
        billing_id: billingId, 
        status: 4, 
        action:'process'
      });
      setBilling(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.message || "Tiada maklumat untuk semakan");
      handleCloseModal();
    } finally {
      setLoading(false);
    }
  }, [billingId, showModal]);

  const handleApprove = async () => {
    // Clear any previous errors
    setRemarksError('');
    
    // For approve, remarks are optional - no validation needed
    try {
      setProcessing(true);
      await apiClient.post(`/billings/${billing.id}/finance-verify`, {
        remarks: billing.remarks || ''
      });
      
      // Invalidate queries to refresh dashboard data
      await queryClient.invalidateQueries({
        queryKey: ['userData', currentUser?.id]
      });
      
      setVerificationSuccess(true);
      toast.success("Bil berjaya disahkan");
      
      // Tunggu sebentar untuk show success state
      handleCloseModal();
      if (onVerificationComplete) {
        onVerificationComplete('verify', "Bil berjaya disahkan");
      }
      
    } catch (error) {
      console.error("Error approving billing:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Tidak berjaya disahkan");
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    // Clear any previous errors
    setRemarksError('');
    
    // For reject, remarks are mandatory
    if (!billing.remarks || billing.remarks.trim() === '') {
      setRemarksError('Catatan penolakan adalah wajib');
      toast.error('Sila nyatakan catatan penolakan');
      return;
    }
    
    try {
      setProcessing(true);
      await apiClient.post(`/billings/${billing.id}/reject`, { 
        reason: billing.remarks.trim() 
      });
      
      // Invalidate queries to refresh dashboard data
      await queryClient.invalidateQueries({
        queryKey: ['userData', currentUser?.id]
      });
      
      setVerificationSuccess(true);
      toast.success("Bil berjaya ditolak");
      
      // Tunggu sebentar untuk show success state
      handleCloseModal();
      if (onVerificationComplete) {
        onVerificationComplete('reject', "Bil berjaya ditolak");
      }
      
    } catch (error) {
      console.error("Error rejecting billing:", error);
      toast.error(error.response?.data?.message || "Tidak berjaya ditolak");
      setProcessing(false);
    }
  };

  const handleRemarksChange = (e) => {
    setBilling({ ...billing, remarks: e.target.value });
    // Clear error when user starts typing
    if (remarksError) {
      setRemarksError('');
    }
  };

  const handleCloseModal = () => {
    if (!processing) {
      setBilling(null);
      setLoading(false);
      setProcessing(false);
      setVerificationSuccess(false);
      setRemarksError('');
      onCloseModal();
    }
  };

  useEffect(() => {
    if (showModal && billingId) {
      fetchBillingData();
    }
  }, [showModal, billingId, fetchBillingData]);

  if (!showModal) return null;

  // Render approval buttons
  const renderActionButtons = () => {
    if (verificationSuccess) {
      return (
        <div className="flex justify-end space-x-3">
          <TButton color="green" size="md" variant="solid" isDisable={true}>
            <Check className="w-4 h-4" />
            <span>Berjaya Diproses!</span>
          </TButton>
        </div>
      );
    }
    
    return (
      <div className="flex justify-end space-x-3">
        <TButton onClick={handleCloseModal} disabled={processing} color="light"className="px-4 py-2">
          <ChevronLeft className="w-4 h-4 mr-2" /> Tutup
        </TButton>
        <TButton onClick={handleReject} disabled={processing} color="red" className="px-4 py-2">
          <X className="w-4 h-4 mr-2" /> Tolak
        </TButton>
        <TButton onClick={handleApprove} disabled={processing} color="green" className="px-4 py-2">
          <Check className="w-4 h-4 mr-2" />
          Pengesahan 
          {processing && <TSpinner className="-mr-1 ml-2" />}
        </TButton>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseModal}></div>

      <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        
        {/* Success Overlay */}
        {verificationSuccess && (
          <div className="absolute inset-0 bg-green-50 bg-opacity-95 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800">Bil Berjaya Diproses!</h3>
              <p className="text-sm text-green-600">Memuat kembali data...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {loading ? "Memuatkan..." : billing ? `Pengesahan Bil #${billing.running_no}` : "Pengesahan Bil"}
              </h1>
              {billing && <p className="mt-1 text-sm text-gray-500">Dicipta pada: {formatDate(billing.created_at)}</p>}
            </div>
            {/* <button
              onClick={handleCloseModal}
              disabled={processing}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button> */}
            <TButton onClick={handleCloseModal} isDisable={processing} color="ghost" size="lg" variant="subtle" circle={true} className="disabled:opacity-50">
              <X className="w-6 h-6" />
            </TButton>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <TLoadingSpinner position={TLoadingSpinner.Position.CENTER} />
            </div>
          ) : !billing ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Bil tidak dijumpai</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Billing Info */}
              <BillingVerifyInfoDialog billing={billing} />
              
              {/* Budget Details */}
              <BillingVerifyBudgetDialog billing={billing} />
              
              {/* Bank Details */}
              <BillingVerifyBankDialog billing={billing} />
              
              {/* Remarks Section with Conditional Requirements */}
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Catatan</h2>
                </div>
                
                <div className="space-y-2">
                  <textarea 
                    value={billing.remarks || ''} 
                    onChange={handleRemarksChange}
                    className={`mt-2 border rounded w-full p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      remarksError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Nyatakan catatan di sini..."
                  />
                  
                  {remarksError && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {remarksError}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    • Untuk <strong>penolakan</strong>: Catatan adalah wajib dan mesti diisi
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        {billing && !loading && (
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
            {renderActionButtons()}
          </div>
        )}
      </div>
    </div>
  );
}

// Simplified components for dialog use
const BillingVerifyInfoDialog = ({ billing }) => {
  const billDetails = [
    { label: 'No. Rujukan', value: billing.running_no },
    { label: 'Tarikh Bil', value: formatDate(billing.issued_at) },
    { label: 'Kaedah Bayaran', value: billing.payment_method }
  ];

  const creatorDetails = [
    { label: 'Pemohon', value: billing.creator?.name },
    { label: 'Jabatan', value: billing.department },
    { label: 'Jawatan', value: billing.creator?.position }
  ];

  const recipientDetails = [
    { label: 'Nama Penerima', value: billing.recipient }
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Pemohon</h2>
        <dl className="space-y-2">
          {creatorDetails.map((detail, index) => (
            <div key={index}>
              <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
              <dd className="text-sm text-gray-900">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Bil</h2>
        <dl className="space-y-2">
          {billDetails.map((detail, index) => (
            <div key={index}>
              <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
              <dd className="text-sm text-gray-900">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Penerima</h2>
        <dl className="space-y-2">
          {recipientDetails.map((detail, index) => (
            <div key={index}>
              <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
              <dd className="text-sm text-gray-900">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

const BillingVerifyBudgetDialog = ({ billing }) => {
  const totalAmount = billing.details?.filter(d => d.accept === 1).reduce((sum, detail) => sum + parseFloat(detail.total || 0), 0);
  
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Butiran Perbelanjaan</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Kod Bajet</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Baki Semasa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantiti</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Harga Seunit (RM)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Jumlah (RM)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {billing.details?.filter(d => d.accept === 1)?.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.budget_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.budget_bal)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6" className="text-right px-6 py-4 text-sm font-medium text-gray-900">Jumlah</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const BillingVerifyBankDialog = ({ billing }) => {
  const transactions = billing?.transactions || [];
  const totalAccepted = billing?.details?.filter(detail => detail.accept).reduce((sum, detail) => sum + parseFloat(detail.total || 0), 0) || 0;

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Butiran Pembayar</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4">Bil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Baki Semasa</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Jumlah (RM)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.bank_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(transaction?.balance || 0)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(transaction?.amount || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-right px-6 py-4 text-sm font-medium text-gray-900">Jumlah</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(totalAccepted)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default FinanceVerifyDialog;