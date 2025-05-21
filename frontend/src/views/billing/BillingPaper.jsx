import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckIcon, Trash2, PrinterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatCurrency, formatDate, formatTitle } from "../../config/format";
import PageComponent from "../../components/PageComponent";
import TButton from "../../components/Core/TButton";
import BillingActionModal from "../../components/modals/BillingActionModal";
import apiClient from "../../axios";
import logoMBI from "../../assets/logo/mbi-head.png"
import TLoadingSpinner from "../../components/Core/TLoadingSpinner";

const BillingPaper = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [billing, setBilling] = useState(null);
  const [history, setHistory] = useState([]);
  const [details, setDetails] = useState([]);
  const [action, setAction] = useState(null); // 'reject' atau 'return'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [endPointApprove, setEndPointApprove] = useState(null);
  const { idBilling, pageback } = useParams();

  const endPointsByStatus = {
    2: { endPoint: "hod-approve", title: "Kelulusan Ketua Jabatan" },
    3: { endPoint: "finance-review", title: "Semakan Kewangan" },
    4: { endPoint: "finance-verify", title: "Pengesahan Kewangan" },
    5: { endPoint: "finance-approve", title: "Kelulusan Kewangan" },
    6: { endPoint: "process-payment", title: "Pemprosesan Pembayaran" },
    7: { endPoint: "paid-complete", title: "Pembayaran Dibuat" },
  };

  const actionButtons = [
    {
      type: "approve",
      icon: CheckIcon,
      label: "Sahkan",
      colorClass: "!bg-green-500 hover:bg-green-600",
    },
    {
      type: "reject",
      icon: Trash2,
      label: "Tolak",
      colorClass: "!bg-red-500 hover:bg-red-600",
    },
    // {
    //   type: "return",
    //   icon: Pencil,
    //   label: "Dikembalikan",
    //   colorClass: "!bg-yellow-500 hover:bg-yellow-600",
    // },
  ];

  const agency = {
    name: "MENTERI BESAR KEDAH INCORPORATED",
    address: "Aras 2 Blok A, Wisma Darulaman, 05503 Alor Setar, Kedah Darulaman",
    tel: "04-730 2137 / 731 0122",
    fax: "04-774 4076",
  };

  const handleAction = async (id, actionType) => {
    if (!["approve", "reject", "return"].includes(actionType)) {
      toast.error("Aktivity tidak boleh diteruskan, sila maklum kepada admin");
      return;
    }
    setAction(actionType);
    setShowConfirmation(true);
  };

  const getEndpointForAction = () => {
    const _endpoints = {
      reject: "reject",
      approve: endPointApprove,
      return: "return",
    };

    return `/billings/${idBilling}/${_endpoints[action]}`;
  };

  const getActionText = (action, type = "verb") => {
    const actionTexts = {
      reject: { verb: "menolak", noun: "Ditolak", reason: "penolakan" },
      approve: { verb: "mengesahkan", noun: "Disahkan", reason: "pengesahan" },
      // return: {
      //   verb: "memulangkan",
      //   noun: "Dipulangkan",
      //   reason: "pemulangan",
      // },
    };
    return actionTexts[action]?.[type] || "";
  };

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const { data } = await apiClient.get(`/billings/${idBilling}`);
        console.log(data);
        setBilling(data);
        setDetails(data?.details.filter(detail => detail.accept) || []);
        setHistory(data?.history?.filter((h) => h.old_status > 0)?.sort((a, b) => a.old_status - b.old_status) || []);
        setEndPointApprove(endPointsByStatus[data?.status_id]?.endPoint || null);
      } catch (error) {
        console.error("Error fetching billing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBilling();
  }, [idBilling]);

  if (!pageback) {
    return <></>;
  }
  if (isLoading) {
    return (
      <PageComponent title="Paparan Permohonan">
        <div className="flex items-center justify-center h-[calc(100vh-90px)]">
          {/* <div className="text-xl">Loading...</div> */}
          <TLoadingSpinner position={TLoadingSpinner.Position.CENTER} />
        </div>
      </PageComponent>
    );
  }

  const print = async () => {
    try {
      // Rekod aktiviti percetakan
      await apiClient.post(`/billings/${idBilling}/record-print`);
      
      // Proses percetakan seperti biasa
      const printContents = document.getElementById("printpage").innerHTML;
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write("<html><head><title>Print</title>");
      doc.write(
        '<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">'
      );
      doc.write("</head><body>");
      doc.write(printContents);
      doc.write("</body></html>");
      setTimeout(() => {
        doc.close();
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        document.body.removeChild(iframe);
      }, 500);
    } catch (error) {
      console.error("Error recording print:", error);
      toast.error("Gagal merekodkan aktiviti percetakan: " + (error.response?.data?.message || "Ralat tidak diketahui"));
    }
  };

  return (
    <PageComponent
      title="Paparan Permohonan"
      buttons={
        !isLoading && (
          <div className="flex gap-2">
            <TButton color="light" to={`/billing/${pageback}`}>Kembali</TButton>
            <TButton onClick={print} className="bg-blue-500 text-white font-bold py-2 px-4 rounded"><PrinterIcon size={16} className="mr-1" />Cetak</TButton>
            {((pageback === "hod" && billing?.status_id === 2) ||
              (pageback === "finance" &&
                [3, 4, 5].includes(billing?.status_id))) &&
              actionButtons
                .filter(button => {
                  // Jika status_id adalah 5, hanya paparkan butang approve
                  if (billing?.status_id === 5) return button.type === "approve";
                  // Untuk status lain, paparkan semua butang
                  return true;
                })
                .map(({ type, icon: Icon, label, colorClass }) => (
                  <TButton key={type} onClick={() => handleAction(billing.id, type)} className={colorClass}>
                    <Icon size={16} className="mr-1" />
                    {label}
                  </TButton>
                ))}
          </div>
        )
      }
    >
      {showConfirmation && action && (
        <BillingActionModal
          onClose={() => {
            setShowConfirmation(false);
            setAction(null);
          }}
          title={endPointsByStatus[billing?.status_id]?.title}
          message={getActionText(action, "reason")}
          confirmText={getActionText(action, "noun")}
          endpoint={getEndpointForAction()}
          callBack={() => navigate(`/billing/${pageback}`)}
          total={billing?.total_amount}
          details={details}
          status={billing?.status_id}
          actionType={action}
          color={actionButtons.find(({ type }) => type === action)?.colorClass}
        />
      )}

      <div className="px-4 py-6 h-[calc(100vh-90px)] scrollable-y-hover overflow-auto">
        <div
          style={{
            backgroundColor: "#fff",
            width: "210mm",
            height: "297mm",
            padding: "10mm",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            margin: "auto",
          }}
        >
          <div id="printpage" className="paper A4">
            <style>
              {`
                .sheet { font-size: 8pt; }
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
                <img src={logoMBI} alt="heade-logo" className="head-logo" style={{ width: "200px" }} />
                <div className="pt-4 flex flex-col gap-1">
                  <h4 id="fname" className="text-2xl font-bold">{agency.name}</h4>
                  <span className="text-xs" id="addr">{agency.address}</span>
                  <div className="flex flex-row gap-14 text-xs"><span>Tel : {agency.tel}</span><span>Fax : {agency.fax}</span></div>
                </div>
              </div>
              <table className="table-payment mt-5">
                <colgroup>
                  <col style={{ width: "11cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                  <col style={{ width: "90cm" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="textCenter thBlock fwBold" colSpan="12">PERMOHONAN PEMBAYARAN</th>
                  </tr>
                  <tr>
                    <th className="!text-left th-block fw-bold bg-opacity-25 bg-dark" colSpan="12">A: MAKLUMAT PERMOHONAN</th>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="5">TARIKH PERMOHONAN</td>
                    <td className="text-left" colSpan="4">{formatDate(billing?.created_at)}</td>
                    <td className="text-center fw-bold" >NO. SIRI</td>
                    <td className="" colSpan="2">{billing?.running_no}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="5">PERMOHONAN OLEH</td>
                    <td colSpan="7">{billing?.creator?.name}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="5">JABATAN</td>
                    <td colSpan="7">{billing?.department}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="5">NO. PROJEK</td>
                    <td colSpan="7">{billing?.no_project}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold th-title" colSpan="5">NAMA PEMBEKAL/KONTRAKTOR/PENERIMA</td>
                    <td colSpan="7">{billing?.recipient}</td>
                  </tr>

                  <tr>
                    <th className="!text-left th-block fw-bold bg-opacity-25 bg-dark" colSpan="12">B: MAKLUMAT KEPERLUAN</th>
                  </tr>
                  <tr>
                    <td className="text-center th-detail fw-bold">BIL</td>
                    <td className="text-center th-detail fw-bold">KOD BAJET</td>
                    <td className="text-center th-detail fw-bold" colSpan="4">BUTIR BEKALAN/PERKHIDMATAN</td>
                    <td className="text-center th-detail fw-bold" colSpan="2">NO. RUJUKAN/INBOIS</td>
                    <td className="text-center th-detail fw-bold">BIL/UNIT</td>
                    <td className="text-center th-detail fw-bold">KOS/UNIT</td>
                    <td className="text-center th-detail fw-bold" colSpan="2">JUMLAH</td>
                  </tr>

                  {details?.map((detail, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">{detail.budget_code}</td>
                      <td colSpan="4">{detail.description}</td>
                      <td colSpan="2">{detail.reference || ""}</td>
                      <td className="text-center">{detail.quantity}</td>
                      <td className="text-right">{formatCurrency(detail.price)}</td>
                      <td className="text-right" colSpan="2">{formatCurrency(detail.total)}</td>
                    </tr>
                  ))}

                  {/* Tambah baris kosong untuk mencapai 10 baris */}
                  {Array(15 - details?.length)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>
                        <td className="text-center">&nbsp;</td>
                        <td>&nbsp;</td>
                        <td colSpan="4">&nbsp;</td>
                        <td colSpan="2">&nbsp;</td>
                        <td className="text-center">&nbsp;</td>
                        <td className="text-right">&nbsp;</td>
                        <td className="text-right" colSpan="2">&nbsp;</td>
                      </tr>
                    ))}

                  <tr>
                    <td className="" colSpan="12">&nbsp;</td>
                  </tr>
                  
                  <tr>
                    <th className="!text-left fw-bold bg-opacity-25 bg-dark" colSpan="6">C: PERAKUAN KETUA JABATAN</th>
                    <th className="!text-left fw-bold bg-opacity-25 bg-dark" colSpan="6">D: SEMAKAN BAHAGIAN KEWANGAN</th>
                  </tr>
                  <tr>
                    <td className="text-left align-top" colSpan="6">
                      <div className="flex gap-2 min-h-10">
                        <span className="font-medium w-14">ULASAN</span>
                        <span>{history?.[0]?.remarks}</span>
                      </div>
                      <div className="flex flex-col py-2 gap-y-1">
                        <div className="flex gap-2">
                          <span className="font-medium w-14">NAMA</span>
                          <span>{formatTitle(history?.[0]?.created_by)}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium w-14">JAWATAN</span>
                          <span>{formatTitle(history?.[0]?.position)}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium w-14">TARIKH</span>
                          <span>{formatDate(history?.[0]?.created_at)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-left" colSpan="3">
                      <div className="flex gap-2 min-h-10">
                        <span className="font-medium w-14">ULASAN</span>
                        <span>{history?.[1]?.remarks}</span>
                      </div>
                      <div className="flex flex-col py-2 gap-y-1">
                        <div className="flex gap-2">
                          <span className="font-medium w-14">NAMA</span>
                          <span>{formatTitle(history?.[1]?.created_by)}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium w-14">JAWATAN</span>
                          <span>{formatTitle(history?.[1]?.position)}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium w-14">TARIKH</span>
                          <span>{formatDate(history?.[1]?.created_at)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-left align-top" colSpan="3">
                      <div className="flex flex-col">
                        <span className="font-medium mb-2">BAYARAN DARIPADA BANK</span>
                        {billing?.transactions?.map((tx,index)=>(
                          <div key={index} className="flex justify-between">
                            <strong>{tx.bank_name}</strong> <span>{formatCurrency(tx.credit)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <th className="!text-left fw-bold bg-opacity-25 bg-dark" colSpan="12">E: KELULUSAN KETUA PEGAWAI</th>
                  </tr>
                  <tr>
                    <td className="text-left align-top" colSpan="6">
                      <div className="flex gap-2 min-h-10">
                        <span className="font-medium w-14">ULASAN</span>
                        <span>{history?.[2]?.remarks}</span>
                      </div>
                    </td>
                    <td colSpan="6">
                      <div className="flex flex-col py-2 gap-y-1">
                        <div className="flex gap-2">
                          <span className="font-medium w-14">NAMA</span>
                          <span>{formatTitle(history?.[2]?.created_by)}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium w-14">JAWATAN</span>
                          <span>{formatTitle(history?.[2]?.position)}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium w-14">TARIKH</span>
                          <span>{formatDate(history?.[2]?.created_at)}</span>
                        </div>
                      </div>
                    </td>
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
