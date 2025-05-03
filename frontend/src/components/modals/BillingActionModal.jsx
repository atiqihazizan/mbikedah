import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import apiClient from "../../axios";
import TButton from "../Core/TButton";
import BankPaying from "../../views/billing/BankPaying";
import { formatCurrency } from "../../config/format";

export default function BillingActionModal({
  onClose,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  endpoint,
  callBack,
  details,
  status,
  actionType,
  total,
  color,
}) {
  const [comment, setComment] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [needComplete, setNeedComplete] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [errors, setErrors] = useState({
    comment: "",
    transactions: "",
    general: "",
  });

  const handleConfirm = async () => {
    let newErrors = {
      comment: "",
      transactions: "",
      general: "",
    };

    // Reset errors
    setErrors(newErrors);

    // Validation for status 3 (Bayaran)
    if (status === 3) {
      // Validate transactions exist
      if (!transactions.length) {
        newErrors.transactions = "Sila tambah maklumat bayaran";
        setErrors(newErrors);
        return;
      }

      // Calculate total amount from transactions
      const transactionsTotal = transactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0),
        0
      );

      // Check if transactions total matches bill total
      if (Math.abs(transactionsTotal - parseFloat(total)) > 0.01) {
        // Using small epsilon for float comparison
        newErrors.transactions = `Baki bayaran yang diperlukan ialah RM${Math.abs(
          transactionsTotal - parseFloat(total)
        ).toFixed(2)} daripada jumlah bil RM${parseFloat(total).toFixed(2)}`;
        setErrors(newErrors);
        return;
      }
    }

    // Validate comment
    if (!comment.trim() && ![2, 3, 6].includes(status)) {
      newErrors.comment = "Sila masukkan catatan";
      setErrors(newErrors);
      return;
    }

    try {
      setIsActionLoading(true);

      const response = await apiClient.post(endpoint, {
        remarks: comment,
        ...(status === 3 && { transactions }),
      });

      if (response.success) {
        toast.success("Berjaya dikemaskini");
        onClose();
        callBack();
      } else {
        throw new Error(response.message || "Ralat sistem");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.message || error.message || "Ralat sistem"
      );
      newErrors.general =
        error.response?.message || error.message || "Ralat sistem";
      setErrors(newErrors);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    if(actionType === "approve" && [3].includes(status)) {
      // Nyahdayakan butang confirm jika tiada transaksi
      const transactionsTotal = transactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0),
        0
      );
      setNeedComplete(transactionsTotal < parseFloat(total));
    }
  }, [actionType, status, transactions]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 id="modal-title" className="text-lg font-semibold mb-4">
          {title}
        </h2>

        {actionType === "approve" && [3].includes(status) && (
          <>
            <p className="text-gray-600 mt-8 mb-2">Budget yang digunakan</p>
            <table className="w-full text-xs text-left text-gray-600">
              <thead>
                <tr>
                  <th className="px-4 py-2 w-3 !pl-0">No.</th>
                  <th className="px-4 py-2 !pl-0 w-20">Kod</th>
                  <th className="px-4 py-2 !pl-0">Perkara</th>
                  <th className="px-4 py-2 !pl-0 w-20 text-right">Amount</th>
                  <th className="px-4 py-2 !pl-0 w-20 text-right">Baki Bajet</th>
                </tr>
              </thead>
              <tbody>
                {details?.map((detail, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 !pl-0 text-center">{index + 1}</td>
                    <td className="px-4 py-2 !pl-0">
                      <span className="font-bold text-xs" title={detail.budget.name}>{detail.budget_code}</span>
                    </td>
                    <td className="px-4 py-2 !pl-0 ">
                      {detail.description}
                    </td>
                    <td className="px-4 py-2 !pl-0 text-right">
                      {formatCurrency(detail.total)}
                    </td>
                    <td className="px-4 py-2 !pl-0 text-right">
                      {formatCurrency(detail.budget.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr className="border-t border-gray-300 my-4 border-dashed" />

            <BankPaying
              setTransactions={setTransactions}
              error={errors}
              setError={setErrors}
              total={total}
            />

            <hr className="border-t border-gray-300 my-4 border-dashed" />
          </>
        )}

        <p className="text-gray-600 mb-2">
          {actionType !== "approve"
            ? `Sila nyatakan sebab ${message} `
            : "Catatan pengesahan (jika perlu)"}{" "}
          {actionType !== "approve" && <span className="text-red-500">*</span>}:
        </p>

        <textarea
          className={`w-full border ${
            errors.comment ? "border-red-500" : "border-gray-300"
          } rounded-md p-2`}
          placeholder="Masukkan catatan..."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErrors((prev) => ({ ...prev, comment: "" }));
          }}
          aria-label="Catatan"
        ></textarea>
        {errors.comment && (
          <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
        )}

        {errors.general && (
          <p className="text-red-500 text-xs mt-2 mb-2">{errors.general}</p>
        )}

        <div className="mt-4 flex justify-end space-x-3">
          <TButton
            onClick={onClose}
            disabled={isActionLoading}
            className={`${
              isActionLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            color="light"
          >
            {cancelText}
          </TButton>
          <TButton
            onClick={() => {
              if (!(isActionLoading || needComplete)) {
                handleConfirm();
              }
            }}
            disabled={isActionLoading || needComplete}
            className={`${color} ${
              (isActionLoading || needComplete) ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={needComplete ? "Sila tambah maklumat bayaran terlebih dahulu" : ""}
          >
            {isActionLoading ? (
              <div className="flex items-center space-x-2">
                <div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                  aria-hidden="true"
                ></div>
                <span>Memproses...</span>
              </div>
            ) : (
              confirmText
            )}
          </TButton>
        </div>
      </div>
    </div>
  );
}

BillingActionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isLoading: PropTypes.bool,
};
