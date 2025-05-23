import { useMemo } from 'react';
import { formatCurrency, formatDate } from '../../config/format';

const BillingPaymentInfo = ({ billing }) => {
  const totalAccepted = useMemo(() => billing?.details?.filter(detail => detail.accept === 1).reduce((sum, detail) => sum + parseFloat(detail.total || 0), 0) || 0, [billing?.details]);
  const billDetails = [
    { label: 'No. Rujukan', value: billing.running_no },
    { label: 'Tarikh Bil', value: formatDate(billing.issued_at) },
    { label: 'Kaedah Bayaran', value: billing.payment_method },
    { label: 'Nama Penerima', value: billing.recipient },
    { label: 'Jumlah Permohonan', value: formatCurrency(totalAccepted) },
  ];

  return (
    <div>
      {/* Bill Details */}
      <div className="mt-8">

        <div>
          {/* <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Bil</h2> */}
          <dl className="flex flex-row gap-x-28">
            {billDetails.map((detail, index) => (
              <div key={index} className="">
                <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                <dd className={`mt-1 text-sm text-gray-900 ${index === 4 ? 'text-green-600 font-bold text-right' : ''}`}>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </div>
  );
};

export default BillingPaymentInfo;
