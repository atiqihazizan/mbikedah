import { formatDate } from '../../config/format';

const BillingVerifyInfo = ({ billing }) => {
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
    { label: 'Nama Penerima', value: billing.recipient },
  ];

  return (
    <div>
      {/* Bill Details */}
      <div className="mt-8 grid grid-cols-3 gap-6">

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Pemohon</h2>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
          {creatorDetails.map((detail, index) => (
            <div key={index} className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
              <dd className="mt-1 text-sm text-gray-900">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Bil</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
            {billDetails.map((detail, index) => (
              <div key={index} className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                <dd className="mt-1 text-sm text-gray-900">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Penerima</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
            {recipientDetails.map((detail, index) => (
              <div key={index} className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                <dd className="mt-1 text-sm text-gray-900">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default BillingVerifyInfo;
