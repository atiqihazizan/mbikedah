import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../../config/format";
import apiClient from "../../axios";
import PageComponent from "../../components/PageComponent";
import TButton from "../../components/Core/TButton";
import Card from "../../components/Card";

const BillingView = () => {
  const { idBilling } = useParams();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const total = useMemo(() => billing?.details?.filter(d => d.accept === 1).reduce((total, item) => total + item.total, 0) || 0, [billing?.details]);
  const statusColorMap = {
    1: "bg-gray-300 text-gray-800",      // Draf
    2: "bg-yellow-200 text-yellow-800",  // Kelulusan HOD
    3: "bg-blue-200 text-blue-800",      // Semakan Kewangan
    4: "bg-blue-400 text-white",         // Pengesahan Kewangan
    5: "bg-indigo-200 text-indigo-800",  // Kelulusan Kewangan
    6: "bg-orange-200 text-orange-800",  // Proses Bayaran
    7: "bg-green-200 text-green-800",    // Selesai
    8: "bg-red-200 text-red-800",        // Ditolak
    9: "bg-pink-200 text-pink-800",      // Dikembalikan
    10: "bg-red-400 text-white",         // Dibatalkan
  };

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const { data } = await apiClient.get(`/billings/${idBilling}`);
        setBilling(data);
      } catch (error) {
        setBilling(null);
      } finally {
        setLoading(false);
      }
    };
    if (idBilling) fetchBilling();
  }, [idBilling]);

  if (loading)
    return <div className="flex justify-center items-center min-h-[200px] text-gray-500">Memuatkan maklumat bil...</div>;
  if (!billing)
    return <div className="flex justify-center items-center min-h-[200px] text-red-500">Maklumat bil tidak dijumpai.</div>;

  return (
    <PageComponent
      title="Butiran Permohonan Bayaran"
      buttons={!loading && (
        <div className="flex gap-2">
          <TButton color="light" to={'/billing/incomplete'}>Kembali</TButton>
          {/* {canEdit && (
            <>
              <TButton 
                color="light" 
                onClick={saveDraft}
                // isDisable={loading || !checkValid()}
              >
                Simpan sebagai Draf
              </TButton>
              <TButton 
                color="green" 
                onClick={submitToHOD}
                // isDisable={loading || !checkValid() }
              >
                Hantar ke Ketua Jabatan
              </TButton>
            </>
          )} */}
        </div>
      )}
    >

      <div className="container py-5">
        <div className="grid gap-5 lg:gap-7.5 gow">
          <Card>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-8">
                <div>
                  <div className="text-gray-500 text-sm">No Bil</div>
                  <div className="font-semibold">{billing.running_no}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Tarikh Bil</div>
                  <div className="font-semibold">{formatDate(billing.issued_at)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Penerima</div>
                  <div className="font-semibold">{billing.recipient}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Jumlah</div>
                  <div className="font-semibold">{formatCurrency(total)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Kaedah Bayaran</div>
                  <div className="font-semibold">{billing.payment_method}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Status</div>
                  <span className={`px-3 py-1 font-semibold text-xs shadow ${statusColorMap[billing.status_id]}`}>
                    {billing.status_name}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 text-blue-600">Senarai Item Bayaran</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border rounded-lg">
                  <thead>
                    <tr className="bg-blue-100 text-blue-700">
                      <th className="py-2 px-3 border-b text-left">Budget</th>
                      <th className="py-2 px-3 border-b text-left">Keterangan Butiran</th>
                      <th className="py-2 px-3 border-b text-left">No. Rujukan</th>
                      <th className="py-2 px-3 border-b">Bil/Unit</th>
                      <th className="py-2 px-3 border-b text-right">Kos Seunit</th>
                      <th className="py-2 px-3 border-b text-right">Jumlah</th>
                      <th className="py-2 px-3 border-b text-center">Kewangan Terima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing.details && billing.details.length > 0 ? (
                      billing.details.map((item, idx) => (
                        <tr key={idx} className={`hover:bg-blue-50 ${item.accept === 0 ? 'line-through text-gray-400' : ''}`}>
                          <td className="py-2 px-3 border-b">{item?.budget_code}</td>
                          <td className="py-2 px-3 border-b">{item?.description}</td>
                          <td className="py-2 px-3 border-b">{item?.reference}</td>
                          <td className="py-2 px-3 border-b text-center">{item?.quantity}</td>
                          <td className="py-2 px-3 border-b text-right">{formatCurrency(item?.price)}</td>
                          <td className="py-2 px-3 border-b text-right">{formatCurrency(item?.total)}</td>
                          <td className="py-2 px-3 border-b text-center">
                            {item?.accept === -1 ? (
                              <span className="text-yellow-500">Belum Disemak</span>
                            ) : item?.accept === 1 ? (
                              <span className="text-green-500">Diterima</span>
                            ) : (
                              <span className="text-red-500">Tidak Diterima</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-3 text-center text-gray-400">
                          Tiada item.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
            </Card.Body>
          </Card>
        </div>
      </div>
    </PageComponent>
  );
};

export default BillingView;