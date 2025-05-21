import { Check, X } from 'lucide-react';
import { useMemo } from 'react';
import { formatCurrency } from '../../config/format';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import TButton from '../../components/Core/TButton';
import TSpinner from '../../components/Core/TSpinner';
import apiClient from '../../axios';

const BillingVerifyBank = ({billing,processing,setProcessing}) => {
  const navigate = useNavigate();
  const transactions = useMemo(() => billing?.transactions || [], [billing?.transactions]);
  const totalAccepted = useMemo(() => billing?.details?.filter(detail => detail.accept).reduce((sum, detail) => sum + parseFloat(detail.total || 0), 0) || 0, [billing?.details]);

  const handleApprove = async () => {
    const reason = window.prompt("Adakah anda pasti untuk mengesahkan bil ini?\nNyatakan ulasan jika ada:");
    if(reason === null) return;
    try {
      setProcessing(true);
      await apiClient.post(`/billings/${billing.id}/finance-verify`, {remarks: reason});
      toast.success("Bil berjaya diluluskan");
      navigate("/billing/finance");
    } catch (error) {
      console.error("Error approving billing:", error.response.data.message);
      toast.error("Gagal meluluskan bil");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Sila nyatakan sebab penolakan:");
    if (reason) {
      try {
        setProcessing(true);
        await apiClient.post(`/billings/${billing.id}/reject`, { reason });
        toast.success("Bil berjaya ditolak");
        navigate("/billing/finance");
      } catch (error) {
        console.error("Error rejecting billing:", error);
        toast.error("Gagal menolak bil");
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="my-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Butiran Pembayar</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4">Bil</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Baki Semasa</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Jumlah (RM)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => {
              return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-top">{transaction.bank_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">{formatCurrency(transaction?.latest_bal || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">{formatCurrency(transaction?.credit || 0)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-right px-6 py-4 text-sm font-medium text-gray-900">Jumlah</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(totalAccepted)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 px-5 py-5 border-t border-gray-200 flex justify-end space-x-3">
        <TButton onClick={handleReject} disabled={processing} color="red" className="px-4 py-2"><X className="w-4 h-4 mr-2" /> Tolak</TButton>
        <TButton onClick={handleApprove} disabled={processing} color="green" className="px-4 py-2">
          <Check className="w-4 h-4 mr-2" />Pengesahan {processing && <TSpinner className="-mr-1 ml-2" />}
        </TButton>
      </div>
    </div>
    
  );
};

export default BillingVerifyBank;