import { Check, PlusIcon, X } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { formatCurrency } from '../../config/format';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import FormC from '../../components/FormContext';
import TButton from '../../components/Core/TButton';
import TSpinner from '../../components/Core/TSpinner';
import TSelect from '../../components/Core/TSelect';
import apiClient from '../../axios';

const BillingCheckBank = ({billing,setBilling,banks,processing,setProcessing}) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(billing?.transactions || []);
  const [totalExpenses] = useState(billing?.total_amount || 0);
  const totalAmount = useMemo(() => transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0), [transactions]);
  const totalAccepted = useMemo(() => billing?.details?.filter(detail => detail.accept).reduce((sum, detail) => sum + parseFloat(detail.total || 0), 0) || 0, [billing?.details]);
  const paymentMethods = [
    { value: 'cek', label: 'Cek' },
    { value: 'online', label: 'Online' },
    { value: 'tunai', label: 'Tunai' }
  ];

  const handleApprove = async () => {
    if(totalAccepted === 0){
      toast.error("Tiada butiran perbelanjaan yang dipilih");
      return;
    }

    if(billing?.transactions?.length === 0){
      toast.error("Maklumat pembayar belum dimasukkan");
      return;
    }

    if(billing?.payment_method === ""){
      toast.error("Kaedah bayaran belum dipilih");
      return;
    }

    if(totalAmount !== totalAccepted){
      toast.error("Jumlah pembayar tidak sepadan dengan jumlah yang diterima");
      return;
    }

    if (window.confirm("Adakah anda pasti untuk meluluskan bil ini?")) {
      try {
        setProcessing(true);
        const dataPost = {
          remarks: "", 
          transactions: billing?.transactions,
          details: billing?.details?.filter(detail => detail.accept),
          total_accept: totalAccepted,
          payment_method: billing?.payment_method.toLowerCase() || ''
        };
        await apiClient.post(`/billings/${billing.id}/finance-review`, dataPost);
        toast.success("Bil berjaya diluluskan");
        navigate("/billing/finance");
      } catch (error) {
        console.error("Error approving billing:", error.response.data.message);
        toast.error("Gagal meluluskan bil");
      } finally {
        setProcessing(false);
      }
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

  useEffect(()=>{
    setBilling({...billing, transactions: transactions});
  },[transactions,billing,setBilling])

  return (
    <div className="my-8">
      {/* Payment Method */}
      
      <h2 className="text-lg font-medium text-gray-900 mb-4">Butiran Pembayar</h2>
      <div className="overflow-x-auto">
        <FormC data={transactions}>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4">Bil</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Baki Semasa</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Jumlah (RM)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Tindakan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => <RowTransaction banks={banks} transactions={transactions} setTransactions={setTransactions} key={index} index={index} totalExpenses={totalExpenses}/>)}
              <RowTransaction banks={banks} transactions={transactions} setTransactions={setTransactions} totalExpenses={totalAccepted}/>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right px-6 py-4 text-sm font-medium text-gray-900">Amount Pembayar</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(totalAmount)}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan="3" className="text-right px-6 py-4 text-sm font-medium text-gray-900">Amount Memohon</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(totalAccepted)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </FormC>
      </div>
      
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Kaedah Bayaran</dt>
        <dd className="mt-1">
        <TSelect 
          list={paymentMethods}  
          keyval="value,label"
          data={billing}
          field="payment_method"
          setValue={setBilling}
          placeholder="Pilih kaedah bayaran"
          isDisabled={processing}
        />
        </dd>
      </div>
      {/* Action Buttons */}
      <div className="mt-8 px-5 py-5 border-t border-gray-200 flex justify-end space-x-3">
        <TButton onClick={() => navigate("/billing/finance")} color="light" className="px-4 py-2">Batal</TButton>
        <TButton onClick={handleReject} disabled={processing} color="red" className="px-4 py-2"><X className="w-4 h-4 mr-2" /> Tolak</TButton>
        <TButton onClick={handleApprove} disabled={processing} color="green" className="px-4 py-2">
          <Check className="w-4 h-4 mr-2" />Lulus {processing && <TSpinner className="-mr-1 ml-2" />}
        </TButton>
      </div>
    </div>
    
  );
};

const RowTransaction = ({ banks, transactions, setTransactions, index, totalExpenses=0 }) => {
  const defaultData = {
    bank_id: '',
    amount: '',
    balance: 0,
  };
  const [errors, setErrors] = useState({
    bank: '',
    amount: '',
    total: '',
  });
  const isExistingTransaction = index !== undefined;
  const transaction = isExistingTransaction ? transactions[index] : defaultData;

  const [preTransactions, setPreTransactions] = useState(defaultData);

  const handleRemoveTransaction = () => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const handleChangeTransaction = (e) => {
    const selectedBank = banks?.find((bank) => bank.id === parseInt(e.target.value));
    setPreTransactions((prev) => ({...prev, bank_id: e.target.value, balance: selectedBank?.amount || 0}));
  };

  const handleChangeCurrency = (e) => {
    setPreTransactions((prev) => ({...prev, amount: e.target.value}));
  };

  
  const handleAddTransaction = () => {
    // Reset semua error
    setErrors({bank: '', amount: '', total: ''});

    // Validasi 1: Bank harus dipilih
    if (!preTransactions.bank_id) {
      setErrors(prev => ({ ...prev, bank: "Sila pilih bank" }));
      return;
    }

    // Validasi 2: Jumlah harus dimasukkan
    if (!preTransactions.amount) {
      setErrors(prev => ({ ...prev, amount: "Sila masukkan jumlah" }));
      return;
    }

    // Validasi 3: Jumlah tidak boleh melebihi jumlah permohonan yang tersisa
    const totalCurrentAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const totalNewAmount = totalCurrentAmount + parseFloat(preTransactions.amount);
    
    if (totalNewAmount > totalExpenses) {
      setErrors(prev => ({ ...prev, amount: `Jumlah melebihi jumlah permohonan` }));
      return;
    }

    // Validasi 4: Jumlah tidak boleh lebih besar daripada baki bank
    const selectedBank = banks?.find((bank) => bank.id === parseInt(preTransactions.bank_id));
    if (selectedBank && parseFloat(preTransactions.amount) > selectedBank.amount) {
      setErrors(prev => ({ ...prev, amount: `Jumlah melebihi baki bank (${formatCurrency(selectedBank.amount)})` }));
      return;
    }

    // Jika semua validasi berhasil, tambahkan transaksi
    const updatedTransactions = [...transactions, preTransactions];
    setTransactions(updatedTransactions);
    setPreTransactions(defaultData);
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isExistingTransaction ? index + 1 : ""}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-top">
        <div className="space-y-2">
          <FormC.select 
            keyval="id,bank_name" 
            listArr={banks} 
            option={{
              value: isExistingTransaction ? transaction.bank_id : preTransactions.bank_id,
              onChange: handleChangeTransaction,
              required: true,
              placeholder: "Pilih bank",
            }}
          />
          {errors.bank && <p className="text-red-500 text-xs mt-1">{errors.bank}</p>}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        {formatCurrency(isExistingTransaction ? transaction.balance : preTransactions.balance)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <div className="space-y-2">
          <FormC.currency 
            value={isExistingTransaction ? transaction.amount : preTransactions.amount}
            onChange={handleChangeCurrency}
            option={{placeholder: "Jumlah (RM)",onFocus: (e) => e.target.select(),required: true}}
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        {isExistingTransaction ? (
          <TButton onClick={handleRemoveTransaction} color="danger" className="btn btn-sm m-auto"><X className="w-5 h-5" /></TButton>
        ) : (
          <TButton onClick={handleAddTransaction} color="primary" className="btn btn-sm m-auto"><PlusIcon className="w-5 h-5" /></TButton>
        )}
      </td>
    </tr>
  );
};

export default BillingCheckBank;