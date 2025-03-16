import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckIcon, Pencil, Trash2, PrinterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageComponent from "../../components/PageComponent";
import TButton from "../../components/Core/TButton";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import apiClient from "../../axios";
import logoMBI from "../../assets/logo/mbi-head.png"

const BillingPaper = () => {
  const { idBilling, pageback } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [billing, setBilling] = useState(null);
  const [history, setHistory] = useState([]);
  const [action, setAction] = useState(null); // 'reject' atau 'return'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [endPointApprove, setEndPointApprove] = useState(null);
  
  const endPointsByStatus = {
    2: "hod-approve",
    3: "finance-review",
    4: "finance-verify",
    5: "finance-approve",
    6: "process-payment",
    7: "paid-complete",
  };

  const actionButtons = [
    { type: 'approve', icon: CheckIcon, label: 'Sahkan', colorClass: '!bg-green-500 hover:bg-green-600' },
    { type: 'reject', icon: Trash2, label: 'Tolak', colorClass: '!bg-red-500 hover:bg-red-600' },
    { type: 'return', icon: Pencil, label: 'Kembali', colorClass: '!bg-yellow-500 hover:bg-yellow-600' },
  ];

  const agency = {
    name: "MENTERI BESAR KEDAH INCORPORATED",
    address: "Aras 2 Blok A, Wisma Darulaman, 05503 Alor Setar, Kedah Darulaman",
    tel: "04-730 2137 / 731 0122",
    fax: "04-774 4076"
  }
  
  const handleAction = async (id, actionType) => {
    if (!['approve', 'reject', 'return'].includes(actionType)) {
      toast.error('Aktivity tidak boleh diteruskan, sila maklum kepada admin');
      return;
    }
    setAction(actionType);
    setShowConfirmation(true);
  };

  const getEndpointForAction = () => {
    const _endpoints = {
      reject: "reject",
      approve: endPointApprove,
      return: "return"
    };
    
    return `/billings/${idBilling}/${_endpoints[action]}`;
  };

  const getActionText = (action, type = 'verb') => {
    const actionTexts = {
      reject: { verb: 'menolak', noun: 'Ditolak', reason: 'penolakan' },
      approve: { verb: 'mengesahkan', noun: 'Disahkan', reason: 'pengesahan' },
      return: { verb: 'memulangkan', noun: 'Dipulangkan', reason: 'pemulangan' }
    };
    return actionTexts[action]?.[type] || '';
  };

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const { data } = await apiClient.get(`/billings/${idBilling}`);
        data.credits = [
          // {text: 'BANK MUAMALAT - 02010004544718', total: 2000000.00},
          // {text: 'BANK MUAMALAT - 02010004544718', total: 2000000.00},
          // {text: 'BANK MUAMALAT - 02010004544718', total: 2000000.00},
          // {text: 'BANK MUAMALAT - 02010004544718', total: 2000000.00}
        ]
        setBilling(data);
        setHistory(data.history.filter(h => h.old_status > 0 ) || []);
        setEndPointApprove(endPointsByStatus[data.status_id]);
      } catch (error) {
        console.error("Error fetching billing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBilling();
  }, [idBilling]);

  if(!pageback){
    return <></>
  }
  if (isLoading) {
    return (
      <PageComponent title="Paparan Permohonan">
        <div className="flex items-center justify-center h-[calc(100vh-90px)]">
          <div className="text-xl">Loading...</div>
        </div>
      </PageComponent>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ms-MY');
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  };

  const print = () => {
    const printContents = document.getElementById('printpage').innerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write('<html><head><title>Print</title>');
    doc.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
    doc.write('</head><body>');
    doc.write(printContents);
    doc.write('</body></html>');
    setTimeout(() => {
      doc.close();
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  return (
    <PageComponent
      title="Paparan Permohonan"
      buttons={
        !isLoading && (
          <div className="flex gap-2">
            <TButton color="light" to={`/billing/${pageback}`}>Kembali</TButton>
            {([3,4,5,6].includes(billing.status_id) && 
              <TButton onClick={print} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                <PrinterIcon size={16} className="mr-1" />
                Print
              </TButton>)}
            {(
              (pageback === 'hod' && billing.status_id === 2) ||
              (pageback === 'finance' && [3,4,5,6].includes(billing.status_id))
            ) && 
            actionButtons.map(({ type, icon: Icon, label, colorClass }) => (
              <TButton key={type} onClick={() => handleAction(billing.id, type)} className={colorClass}>
                <Icon size={16} className="mr-1" />{label}
              </TButton>
            ))}
          </div>
        )
      }
    >
      {showConfirmation && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setShowConfirmation(false)}
          title="Pengesahan tindakan"
          message={getActionText(action, "reason")}
          confirmText={getActionText(action, "noun")}
          action={action}
          setAction={setAction}
          endpoint={getEndpointForAction()}
          callBack={() => navigate(`/billing/${pageback}`)}
        />
      )}

      <div className="px-4 py-6 h-[calc(100vh-90px)] scrollable-y-hover overflow-auto">
        <div
          style={{
            backgroundColor: "#fff",
            width: "210mm",
            // height: "297mm",
            padding: "10mm",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            margin: "auto",
          }}
        >
          <div id="printpage" className="paper A4">
            <style>
              {`
                .sheet { font-size: 7pt; }
                .table-payment td,
                .table-payment th {border: 1px solid;padding: 0.3rem 0.5rem;}
                .table-payment th {text-align: center;}
                .table-payment .colgroup-0 {width : 5%;}
                .table-payment .colgroup {width : 3%;}
                #form-payment .rejected {color:#f1416c; position: absolute;font-size: 10rem;top: 47%;left: 26%;transform: rotate(-41deg);}

                div#tab41 .header { display: none}
                @media print {
                  body { padding: 10mm; margin: 0; font-size: 7pt;}
                  .table-payment * { font-size: 7pt }
                  .table-payment .th-title { font-size: 7pt }
                  .table-payment .th-block { font-size: 8pt }
                  .table-payment .th-detail { font-size: 6pt }
                }
              `}
            </style>
            <div className="sheet" id="form-payment" style={{ position: "relative" }}>
              <div className="mt-1 flex flex-row gap-5">
                <img src={logoMBI} alt="heade-logo" className="head-logo" style={{ width: '200px' }} />
                <div className="pt-4 flex flex-col gap-1">
                  <h4 id="fname" className="text-2xl font-bold">{agency.name}</h4>
                  <span className="text-sm" id="addr">{agency.address}</span>
                  <div className="flex flex-row gap-14 text-sm">
                    <span>Tel : {agency.tel}</span>
                    <span>Fax : {agency.fax}</span>
                  </div>
                </div>
              </div>
              <table className="table-payment mt-2">
                <colgroup>
                  <col style={{ width: "11cm" }} />
                  <col style={{ width: "15cm" }} />
                  <col style={{ width: "102cm" }} />
                  <col style={{ width: "47cm" }} />
                  <col style={{ width: "49cm" }} />
                  <col style={{ width: "111cm" }} />
                  <col style={{ width: "100cm" }} />
                  <col style={{ width: "41cm" }} />
                  <col style={{ width: "55cm" }} />
                  <col style={{ width: "150cm" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="textCenter thBlock fwBold" colSpan="10">PERMOHONAN PEMBAYARAN</th>
                  </tr>
                  <tr>
                    <td className="text-center th-block fw-bold bg-opacity-25 bg-dark" colSpan="10">BAHAGIAN A: MAKLUMAT PERMOHONAN</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="4">TARIKH PERMOHONAN</td>
                    <td className="text-center">{formatDate(billing?.created_at)}</td>
                    <td className="text-center fw-bold">NO. SIRI</td>
                    <td className="" colSpan="4">{billing?.running_no}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="4">PERMOHONAN OLEH</td>
                    <td colSpan="6">{billing?.creator?.name}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="4">JABATAN</td>
                    <td colSpan="6">{billing?.department?.name}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="4">NO. PROJEK</td>
                    <td colSpan="6">{billing?.no_project}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="4">NAMA PEMBEKAL/KONTRAKTOR/PENERIMA</td>
                    <td colSpan="6">{billing?.recipient?.name}</td>
                  </tr>

                  <tr>
                    <th className="text-center th-block fw-bold bg-opacity-25 bg-dark" colSpan="10">BAHAGIAN B: MAKLUMAT KEPERLUAN</th>
                  </tr>
                  <tr>
                    <td className="text-center th-detail fw-bold">BIL</td>
                    <td className="text-center th-detail fw-bold">KOD BAJET</td>
                    <td className="text-center th-detail fw-bold" colSpan="4">BUTIR BEKALAN/PERKHIDMATAN</td>
                    <td className="text-center th-detail fw-bold">NO. RUJUKAN/INBOIS</td>
                    <td className="text-center th-detail fw-bold">BIL/UNIT</td>
                    <td className="text-center th-detail fw-bold">KOS/UNIT</td>
                    <td className="text-center th-detail fw-bold">JUMLAH</td>
                  </tr>

                  {billing?.details?.map((detail, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">{detail.budget?.code}</td>
                      <td colSpan="4">{detail.description}</td>
                      <td>{detail.reference || ""}</td>
                      <td className="text-center">{detail.quantity}</td>
                      <td className="text-right">{Number(detail.price).toFixed(2)}</td>
                      <td className="text-right">{Number(detail.total).toFixed(2)}</td>
                    </tr>
                  ))}
                  
                  {/* Tambah baris kosong untuk mencapai 10 baris */}
                  {Array(10 - billing?.details?.length - billing?.credits?.length).fill(0).map((_, index) => (
                    <tr key={index}>
                      <td className="text-center">&nbsp;</td>
                      <td className="text-center">&nbsp;</td>
                      <td colSpan="4">&nbsp;</td>
                      <td>&nbsp;</td>
                      <td className="text-center">&nbsp;</td>
                      <td className="text-right">&nbsp;</td>
                      <td className="text-right">&nbsp;</td>
                    </tr>
                  ))}
                  
                  <tr>
                    <td className="text-center fw-bold" colSpan="10">TUJUAN/KETERANGAN BAYARAN</td>
                  </tr>
                  <tr>
                    <td className="" colSpan="10">{billing?.description}</td>
                  </tr>
                  <tr>
                    <td className="" colSpan="10">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold" colSpan="5">DISEDIAKAN OLEH</td>
                    <td className="text-center fw-bold">TARIKH</td>
                    <td className="text-center fw-bold" colSpan="3">DISAHKAN OLEH KETUA JABATAN</td>
                    <td className="text-center fw-bold">TARIKH</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="5">{history?.[0]?.created_by}</td>
                    <td className="text-center">{formatDate(history?.[0]?.created_at)}</td>
                    <td className="text-center" colSpan="3">{history?.[1]?.created_by}</td>
                    <td className="text-center">{formatDate(history?.[1]?.created_at)}</td>
                  </tr>

                  <tr>
                    <th className="text-center th-block fw-bold bg-opacity-25 bg-dark" colSpan="10">BAHAGIAN C: SEMAKAN OLEH JABATAN KEWANGAN</th>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold" colSpan="5">DISEMAK OLEH PEGAWAI KEWANGAN</td>
                    <td className="text-center fw-bold">TARIKH</td>
                    <td className="text-center fw-bold" colSpan="3">KOD AKAUN : DEBIT</td>
                    <td className="text-center" colSpan="1">{billing?.debit_account_codes?.join(", ")}</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="5">{history?.[2]?.created_by}</td>
                    <td className="text-center">{formatDate(history?.[2]?.created_at)}</td>
                    <td className="text-center fw-bold" colSpan="3">KOD AKAUN : KREDIT</td>
                    <td className="text-center" colSpan="1">{billing?.credit_account_code}</td>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold" colSpan="6">ULASAN</td>
                    <td className="text-center fw-bold" colSpan="3">NAMA BANK</td>
                    <td className="text-center fw-bold" colSpan="1">BAKI BANK</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="6" rowSpan="2">{history?.[2]?.remarks}</td>
                    <td className="text-center" colSpan="3">
                      <div className="flex flex-col text-start min-h-3">
                        {billing?.credits?.length === 0 && <span>&nbsp;</span>}
                        {billing?.credits?.map((credit, index) => (
                          <span key={index} className="text-start">{credit.text}</span>
                        ))}
                      </div></td>
                    <td className="text-right" colSpan="1">
                      <div className="flex flex-col text-right">
                        {billing?.credits?.map((credit, index) => (
                          <span key={index}>{formatCurrency(credit.total)}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold" colSpan="3">JUMLAH INI</td>
                    <td className="text-right" colSpan="1">{formatCurrency(billing?.credit_verified)}</td>
                  </tr>

                  <tr>
                    <th className="text-center th-block fw-bold bg-opacity-25 bg-dark" colSpan="10">BAHAGIAN D: PENGESAHAN JABATAN KEWANGAN</th>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold" colSpan="5">DISAHKAN OLEH JABATAN KEWANGAN</td>
                    <td className="text-center fw-bold">TARIKH</td>
                    <td className="text-center fw-bold" colSpan="4">ULASAN</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="5">{history?.[3]?.created_by}&nbsp;</td>
                    <td className="text-center">{formatDate(history?.[3]?.created_at)}</td>
                    <td className="text-center" colSpan="4">{history?.[3]?.remarks}</td>
                  </tr>

                  <tr>
                    <th className="text-center th-block fw-bold bg-opacity-25 bg-dark" colSpan="10">BAHAGIAN E: KELULUSAN KETUA JABATAN KEWANGAN</th>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold" colSpan="5">DILULUSKAN OLEH KETUA JABATAN KEWANGAN</td>
                    <td className="text-center fw-bold">TARIKH</td>
                    <td className="text-center fw-bold" colSpan="4">TANDATANGAN</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="5">&nbsp;</td>
                    <td className="text-center">&nbsp;</td>
                    <td className="text-center" colSpan="4" rowSpan="3">&nbsp;</td>
                  </tr>

                  <tr>
                    <td className="text-center fw-bold" colSpan="6">ULASAN</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="6">&nbsp;</td>
                  </tr>

                  <tr>
                    <th className="text-center th-block fw-bold bg-opacity-25 bg-dark" colSpan="10">BAHAGIAN F: KELULUSAN KETUA PEGAWAI EKSEKUTIF</th>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold" colSpan="5">DILULUSKAN OLEH KETUA PEGAWAI EKSEKUTIF</td>
                    <td className="text-center fw-bold">TARIKH</td>
                    <td className="text-center fw-bold" colSpan="4">TANDATANGAN</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="5">&nbsp;</td>
                    <td className="text-center">&nbsp;</td>
                    <td className="text-center" colSpan="4" rowSpan="3">&nbsp;</td>
                  </tr>

                  <tr>
                    <td className="text-center fw-bold" colSpan="6">ULASAN</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="6">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageComponent>
  );
};

export default BillingPaper;
