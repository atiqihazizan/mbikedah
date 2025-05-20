import { formatDate } from '../../config/format';

const BillingCheckInfo = ({ billing }) => {
  const billDetails = [
    { label: 'No. Rujukan', value: billing.running_no },
    { label: 'Tarikh Bil', value: formatDate(billing.issued_at) }
  ];

  const recipientDetails = [
    { label: 'Nama Penerima', value: billing.recipient },
    { label: 'Jabatan', value: billing.department },
    { label: 'Dicipta Oleh', value: billing.creator?.name },
    { label: 'Jawatan', value: billing.creator?.position }
  ];

  return (
    <div>
      {/* Bill Details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default BillingCheckInfo;

    
{/* Status Badge */}
{/* <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
  <div className="flex items-center">
    <div className="flex-shrink-0"><TAlertIcon /></div>
    <div className="ml-3">
      <h3 className="text-sm font-medium text-yellow-800">Sila semak butiran bil di bawah</h3>
      <div className="mt-2 text-sm text-yellow-700"><p>Pastikan semua maklumat adalah betul sebelum meluluskan bil ini.</p></div>
    </div>
  </div>
</div>
{/* Bill Details */}
{/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Bil</h2>
    <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">No. Rujukan</dt>
        <dd className="mt-1 text-sm text-gray-900">{billing.running_no}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Tarikh Bil</dt>
        <dd className="mt-1 text-sm text-gray-900">{formatDate(billing.issued_at)}</dd>
      </div>

    </dl>
  </div>

  <div>
    <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Penerima</h2>
    <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Nama Penerima</dt>
        <dd className="mt-1 text-sm text-gray-900">{billing.recipient}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Jabatan</dt>
        <dd className="mt-1 text-sm text-gray-900">{billing.department}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Dicipta Oleh</dt>
        <dd className="mt-1 text-sm text-gray-900">{billing.creator?.name}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">Jawatan</dt>
        <dd className="mt-1 text-sm text-gray-900">{billing.creator?.position}</dd>
      </div>
    </dl>
  </div>
</div> */} 