import { Check, PlusIcon, X } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { formatCurrency } from '../../config/format';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import FormC from '../../components/FormContext';
import TButton from '../../components/Core/TButton';
import TSpinner from '../../components/Core/TSpinner';
import apiClient from '../../axios';

const BillingCheckBank = ({billing,banks}) => {
  const navigate = useNavigate();
  const [processing,setProcessing] = useState(false);
  const [transactions, setTransactions] = useState(billing?.transactions || []);
  const totalAmount = useMemo(() => transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0), [transactions]);
  const totalAccepted = useMemo(() => billing?.details?.filter(detail => detail.accept === 1).reduce((sum, detail) => sum + parseFloat(detail.total || 0), 0) || 0, [billing?.details]);
  const [incomplete,setIncomplete] = useState(false);

  const defaultData = {
    id: 0,
    bank_id: '',
    amount: '',
    balance: 0,
    paid_date: '',
    paid_ref: '',
  };

  useEffect(()=>{
    // console.log(transactions.length === 0)
    // console.log(!transactions.every(tx => tx.bank_id && parseFloat(tx.credit || 0) >0))
    // console.log(totalAccepted !== totalAmount)
    if(transactions.length === 0 ) return setIncomplete(true);
    if (!transactions.every(tx => tx.bank_id && parseFloat(tx.amount || 0) >0)) return setIncomplete(true);
    if (!transactions.every(tx => tx.paid_date && tx.paid_ref)) return setIncomplete(true);
    if (totalAccepted !== totalAmount) return setIncomplete(true);
    setIncomplete(false);
  },[totalAccepted,totalAmount,transactions])

  const handleApprove = async () => {
    if (incomplete) return toast.error("Sila pastikan semua bank dipilih dan jumlah credit dimasukkan");
    if( transactions?.length === 0) return toast.error("Maklumat pembayar belum dimasukkan");
    if(totalAmount !== totalAccepted) return toast.error("Jumlah bayaran tidak sama dengan jumlah permohonan");
    const remarks = window.prompt("Adakah anda pasti untuk meluluskan bil ini?\n\nSila nyatakan ulasan anda (Jika perlu)");

    if (remarks !== null) {
      try {
        setProcessing(true);
        const dataPost = {remarks, transactions};
        await apiClient.post(`/billings/${billing.id}/process-payment`, dataPost);
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
    const remarks = window.prompt("Sila nyatakan sebab penolakan:");
    if (remarks) {
      try {
        setProcessing(true);
        await apiClient.post(`/billings/${billing.id}/reject`, { remarks });
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

  const handleAddTransaction = () => {
    setTransactions([...transactions, defaultData]);
  }

  return (
    <div className="my-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Butiran Pembayar</h2>
      <div className="overflow-x-auto">
        <FormC data={transactions}>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4">Bil</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                {/* <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Baki Semasa</th> */}
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Tarikh Bayaran</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-48">No. Rujukan</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Jumlah (RM)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  <TButton onClick={handleAddTransaction} color="primary" className="btn btn-sm m-auto"><PlusIcon className="w-5 h-5" /></TButton>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <RowTransaction banks={banks} transactions={transactions} setTransactions={setTransactions} key={index} index={index} setIncomplete={setIncomplete}/>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right px-6 py-4 text-sm font-medium text-gray-900">Jumlah Bayaran </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(totalAmount)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </FormC>
      </div>
      
      {/* {totalAmount !== totalAccepted && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">Jumlah bayaran tidak sepadan dengan jumlah yang diterima</span>
      </div>} */}

      {/* Action Buttons */}
      <div className="mt-8 px-5 py-5 border-t border-gray-200 flex justify-end space-x-3">
        <TButton onClick={handleReject} isDisable={processing} color="red" className="px-4 py-2"><X className="w-4 h-4 mr-2" /> Tolak</TButton>
        <TButton onClick={handleApprove} isDisable={processing || incomplete} color="green" className="px-4 py-2">
          <Check className="w-4 h-4 mr-2" />Diluluskan {processing && <TSpinner className="-mr-1 ml-2" />}
        </TButton>
      </div>
    </div>
    
  );
};

const RowTransaction = ({ banks, transactions, setTransactions, index, setIncomplete }) => {
  const [errors, setErrors] = useState({
    bank: '',
    amount: '',
    paid_date: '',
    paid_ref: '',
  });

  const [preTransactions, setPreTransactions] = useState(transactions[index]);

  const validateFields = () => {
    let newErrors = {};
    
    if (!preTransactions.bank_id) {newErrors.bank = 'Bank diperlukan'}
    if (!preTransactions.amount || parseFloat(preTransactions.amount) <= 0) {newErrors.amount = 'Jumlah diperlukan'}
    if (!preTransactions.paid_date) {newErrors.paid_date = 'Tarikh diperlukan'}
    if (!preTransactions.paid_ref) {newErrors.paid_ref = 'No. Rujukan diperlukan'}
    
    setErrors(newErrors);
    setIncomplete(Object.keys(newErrors).length > 0);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateFields();
  }, [preTransactions]);

  const handleRemoveTransaction = () => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const handleChangeBank = (e) => {
    const selectedBank = banks?.find((bank) => bank.id === parseInt(e.target.value));
    
    const bankIds = transactions.map(tx => parseInt(tx.bank_id));
    const hasDuplicates = bankIds.some((id, i) => id === parseInt(e.target.value) && i !== index);

    if (hasDuplicates) {
      setErrors(prev => ({...prev, bank: `Bank '${selectedBank?.bank_name}' sudah digunakan dalam transaksi lain`}))
      setIncomplete(true);
    } else {
      setTransactions((prev) => {
        const updatedTransactions = [...prev];
        updatedTransactions[index] = { ...prev[index], bank_id: e.target.value, balance: selectedBank?.amount || 0 };
        return updatedTransactions;
      });
      setPreTransactions((prev) => ({...prev, bank_id: e.target.value, balance: selectedBank?.amount || 0}));
    }

  };

  // const handleChangeCurrency = (e) => {
  //   const amount = parseFloat(e.target.value);
  //   setPreTransactions((prev) => ({...prev, amount: amount}));
  //   setTransactions((prev) => {
  //     const updatedTransactions = [...prev];
  //     updatedTransactions[index] = { ...prev[index], amount: amount };
  //     return updatedTransactions;
  //   });
  // };
  const handleChangeInput = (e, type) => {
    const value = type === 'amount' ? parseFloat(e.target.value) : e.target.value;
    setPreTransactions((prev) => ({...prev, [type]: value}));
    setTransactions((prev) => {
      const updatedTransactions = [...prev];
      updatedTransactions[index] = { ...prev[index], [type]: value };
      return updatedTransactions;
    });
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-top">
        <div className="space-y-2">
          <FormC.select keyval="id,bank_name" listArr={banks} option={{value: preTransactions.bank_id, onChange: handleChangeBank, required: true}} />
          {errors.bank && <p className="text-red-500 text-xs mt-1">{errors.bank}</p>}
        </div>
      </td>
      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">{formatCurrency(preTransactions?.balance || 0)}</td> */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <FormC.date value={preTransactions?.paid_date || ''} onChange={(e) => handleChangeInput(e, 'paid_date')} />
        {errors.paid_date && <p className="text-red-500 text-xs mt-1">{errors.paid_date}</p>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <FormC.text value={preTransactions?.paid_ref || ''} onChange={(e) => handleChangeInput(e, 'paid_ref')} />
        {errors.paid_ref && <p className="text-red-500 text-xs mt-1">{errors.paid_ref}</p>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <div className="space-y-2">
          <FormC.currency value={preTransactions?.amount || '0.00'} onChange={(e) => handleChangeInput(e, 'amount')} option={{required: true}} />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <TButton onClick={handleRemoveTransaction} color="danger" className="btn btn-sm m-auto"><X className="w-5 h-5" /></TButton>
      </td>
    </tr>
  );
};

export default BillingCheckBank;