import { formatCurrency } from "../../config/format";
import { PlusIcon, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import apiClient from "../../axios";

const ListBank = ({ banks, setTransactions, error, setError, total }) => {
  const [generalError, setGeneralError] = useState('');
  const [preTx, setPreTx] = useState([]);
  const [duplicateError, setDuplicateError] = useState('');

  const handleDeleteTransaction = (index) => {
    const updatedTransactions = preTx.filter((_, i) => i !== index);
    setPreTx(updatedTransactions);
    setDuplicateError('');
  };

  const handleAddTransaction = (transaction) => {
    // Calculate total amount of all transactions
    const currentTotal = preTx.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const newAmount = parseFloat(transaction.amount || 0);
    const remainingAmount = parseFloat(total) - currentTotal;
    
    // Check if adding new transaction would exceed total
    if (currentTotal + newAmount > parseFloat(total)) {
      setError(prev => ({
        ...prev,
        transactions: `Jumlah bayaran melebihi jumlah bil. Baki yang boleh dibayar: RM${remainingAmount.toFixed(2)}`
      }));
      return;
    }

    // Allow add if total not reached yet
    if (currentTotal + newAmount < parseFloat(total)) {
      const isDuplicate = preTx.some(
        (tx) => tx.bank_id === transaction.bank_id
      );

      if (isDuplicate) {
        setDuplicateError("Bank telah dipilih");
        return;
      }

      const newTransactions = [...preTx, transaction];
      setPreTx(newTransactions);
      setTransactions(newTransactions);
      setDuplicateError("");
      setError(prev => ({
        ...prev,
        transactions: currentTotal + newAmount < parseFloat(total) 
          ? `Baki yang perlu dibayar: RM${(parseFloat(total) - (currentTotal + newAmount)).toFixed(2)}`
          : ""
      }));
    } else if (currentTotal + newAmount === parseFloat(total)) {
      // If exact total reached, add final transaction
      const isDuplicate = preTx.some(
        (tx) => tx.bank_id === transaction.bank_id
      );

      if (isDuplicate) {
        setDuplicateError("Bank telah dipilih");
        return;
      }

      const newTransactions = [...preTx, transaction];
      setPreTx(newTransactions);
      setTransactions(newTransactions);
      setDuplicateError("");
      setError(prev => ({
        ...prev,
        transactions: ""
      }));
    }
  };

  useEffect(() => {
    setTransactions(preTx);
  }, [preTx]);

  // useEffect(() => {
  //   setGeneralError(error);
  // }, [error]);

  return (
    <div>
      <p className="text-gray-600 mb-2">Bank Pembayar <span className="text-red-500">*</span></p>
      <div className="mb-6 flex flex-col gap-2 text-xs">
        <FormC data={preTx}>
            {preTx.map((transaction, index) => (
              <RowTransaction
                key={index}
                transaction={transaction}
                onDelete={() => handleDeleteTransaction(index)}
                banks={banks}
              />
            ))}
            <RowTransaction banks={banks} onAdd={(transaction) => handleAddTransaction(transaction)} />
            {duplicateError && (
              <p className="text-red-500 text-xs mt-1">{duplicateError}</p>
            )}

            {error.transactions && (
              <p className="text-red-500 text-xs ">{error.transactions}</p>
            )}
        </FormC>
      </div>
    </div>
  );
};

const RowTransaction = ({ transaction, onDelete, banks, onAdd }) => {
  const [selectedBankIdState, setSelectedBankIdState] = useState(transaction?.bank_id || '');
  const [transactionAmountState, setTransactionAmountState] = useState(transaction?.amount || '0.00');
  const [errors, setErrors] = useState({
    bank: '',
    amount: ''
  });

  const resetForm = () => {
    setSelectedBankIdState('');
    setTransactionAmountState('0.00');
    setErrors({
      bank: '',
      amount: ''
    });
  };

  const validateInputs = () => {
    const newErrors = {
      bank: '',
      amount: ''
    };

    if (!selectedBankIdState) {
      newErrors.bank = 'Sila pilih bank';
    }

    const amount = parseFloat(transactionAmountState.replace(/,/g, ''));
    if (!amount || amount <= 0) {
      newErrors.amount = 'Jumlah tidak sah';
    }

    setErrors(newErrors);
    return !newErrors.bank && !newErrors.amount;
  };

  const handleAddTransaction = () => {
    if (validateInputs()) {
      const transactionData = {
        bank_id: selectedBankIdState,
        amount: transactionAmountState,
      };
      onAdd(transactionData);
      resetForm(); // Reset form selepas tambah transaksi
    }
  };

  return (
    <div className="flex items-top flex-wrap lg:flex-nowrap gap-2.5">
      <div className="flex-1">
        <FormC.select
          css="select-sm"
          field="bank_id"
          keyval="id,bank_name"
          listArr={banks}
          option={{
            value: selectedBankIdState,
            onChange: (e) => {
              setSelectedBankIdState(e.target.value);
              setErrors((prev) => ({ ...prev, bank: "" }));
            },
            required: true,
            placeholder: "Pilih bank",
          }}
        />
        {errors.bank && (
          <p className="text-red-500 text-xs mt-1">{errors.bank}</p>
        )}
      </div>
      <div className="flex-1">
        <FormC.currency
          css="input-sm"
          value={transactionAmountState}
          onChange={(e) => {
            setTransactionAmountState(e.target.value);
            setErrors((prev) => ({ ...prev, amount: "" }));
          }}
          option={{
            placeholder: "Jumlah (RM)",
            onFocus: (e) => e.target.select(),
            required: true,
          }}
        />
        {errors.amount && (
          <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
        )}
      </div>

      {onDelete && (
        <TButton onClick={onDelete} color="red" className="btn btn-sm">
          <Trash2 className="w-5 h-5" />
        </TButton>
      )}
      {onAdd && (
        <TButton
          onClick={handleAddTransaction}
          color="light"
          className="btn btn-sm"
        >
          <PlusIcon className="w-5 h-5" />
        </TButton>
      )}
    </div>
  );
};

const fetchBanks = async () => {
  try {
    const data = await apiClient.get("/banks");
    return data;
  } catch (error) {
    console.error("Error fetching banks:", error);
    toast.error("Gagal memuatkan data bank.");
  }
};

const BankPaying = ({ setTransactions, error,setError, total }) => {
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    const fetchBanksData = async () => {
      const data = await fetchBanks();
      setBanks(data);
    };
    fetchBanksData();
  }, []);

  return <ListBank banks={banks} setTransactions={setTransactions} error={error} setError={setError} total={total} />;
};

export default BankPaying;