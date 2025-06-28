import React from 'react';
import { Printer } from 'lucide-react';
import { formatCurrency, formatDate, formatTitle } from '../../config/format';
import logoMBI from "../../assets/logo/mbi-head.png"

const ApprovalInfoTable = ({ 
  remarks = '', 
  createdBy = '', 
  position = '', 
  createdAt = '',
}) => {
  return (
    <table className="w-full border-collapse child-table approval-info-table">
      <tbody>
        <tr className="h-10">
          <th className="text-left">ULASAN</th>
          <td>{remarks}</td>
        </tr>
        <tr>
          <th className="text-left">NAMA</th>
          <td>{formatTitle(createdBy)}</td>
        </tr>
        <tr>
          <th className="text-left">JAWATAN</th>
          <td>{formatTitle(position)}</td>
        </tr>
        <tr>
          <th className="text-left">TARIKH</th>
          <td>{formatDate(createdAt)}</td>
        </tr>
      </tbody>
    </table>
  );
};

const BillingPreview = ({ billingData = null }) => {

  // Gunakan data dari props atau default data
  const data =  billingData;

  const agency = {
    name: "MENTERI BESAR KEDAH INCORPORATED",
    address: "Aras 2 Blok A, Wisma Darulaman, 05503 Alor Setar, Kedah Darulaman",
    tel: "04-730 2137 / 731 0122",
    fax: "04-774 4076",
  };

  const details = data?.details?.filter(detail => detail.accept === 1) || [];
  const history = data?.history?.filter((h) => h.old_status > 0)?.sort((a, b) => a.old_status - b.old_status) || [];

  const handlePrint = () => {
    const printContents = document.getElementById("printpage").innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print - ${data?.running_no}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { padding: 5mm; margin: 0; font-size: 7pt; }
            .table-payment { width: 100%; border-collapse: collapse; }
            .table-payment td, .table-payment th { border: 1px solid; padding: 0.3rem 0.5rem; }
            .table-payment th { text-align: center; }
            .th-title { font-size: 7pt; font-weight: bold; }
            .th-block { font-size: 8pt; font-weight: bold; }
            .th-detail { font-size: 6pt; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    doc.close();
    
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Preview Permohonan Pembayaran</h1>
        <button 
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <Printer size={16} />
          Cetak
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">Status Permohonan:</h3>
        <p className="text-blue-700">{data?.status_name || 'N/A'} (Status ID: {data?.status_id || 'N/A'})</p>
        <p className="text-sm text-gray-600 mt-2">
          Jumlah: {formatCurrency(data?.total_amount)} | 
          Kaedah Bayaran: {data?.payment_method?.toUpperCase() || 'N/A'} | 
          Print Count: {data?.print_count || 0}
        </p>
      </div>

      <div className="bg-white shadow-lg" style={{ width: "210mm", margin: "0 auto", padding: "10mm" }}>
        <div id="printpage">
          <style>
            {`
              .table-payment { width: 100%; border-collapse: collapse; }
              .table-payment td, .table-payment th { border: 1px solid #000; padding: 0.3rem 0.5rem; }
              .table-payment th { text-align: center; font-weight: bold; }
              .table-payment th { font-size: 7.5pt; }
              .table-payment td { font-size: 8pt; }
              .th-title { font-weight: bold; background-color: #f8f9fa; font-size: 7pt !important; text-align: left !important; }
              .th-block { font-weight: bold; background-color: #e9ecef; font-size: 8pt !important; }
              .th-detail { font-weight: bold; font-size: 0.55rem !important; }

              table.border-none th, table.border-none td { border: none; }

              .child-table { border-collapse: collapse;}
              .child-table td, .child-table th { border:0; padding:0; padding-top: 0.3rem; padding-left: 0.5rem; vertical-align: top;}
              .child-table tr:first-child td, .child-table tr:first-child th { padding-top: 0;}
              .child-table td:first-child, .child-table th:first-child { padding-left: 0;}
              .child-table th { text-align: left; font-weight: bold !important; font-size: 7pt !important; }
              .child-table td { font-size: 8pt; }
              
              .approval-info-table th:first-child { width: 50px; }
              
              
            `}
          </style>

          <div className="flex flex-row gap-5 mb-5">
            <div className="w-48 h-20 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              <img src={logoMBI} alt="Logo MBI" className="w-full h-full" />
            </div>
            <div className="pt-4 flex flex-col gap-1">
              <h4 className="text-xl font-bold">{agency.name}</h4>
              <span className="text-xs">{agency.address}</span>
              <div className="flex flex-row gap-14 text-xs">
                <span>Tel : {agency.tel}</span>
                <span>Fax : {agency.fax}</span>
              </div>
            </div>
          </div>

          <table className="table-payment">
            <tbody>
              <tr>
                <th className="th-block" colSpan="12">PERMOHONAN PEMBAYARAN</th>
              </tr>
              <tr>
                <th className="text-left th-block" colSpan="12">A: MAKLUMAT PERMOHONAN</th>
              </tr>
              <tr>
                <th className="th-title" colSpan="5">TARIKH PERMOHONAN</th>
                <td className="text-left" colSpan="4">{formatDate(data?.created_at)}</td>
                <th className="text-center font-bold">NO. SIRI</th>
                <td colSpan="2">{data?.running_no || ''}</td>
              </tr>
              <tr>
                <th className="th-title" colSpan="5">PERMOHONAN OLEH</th>
                <td colSpan="7">{data?.creator?.name.toUpperCase() || ''}</td>
              </tr>
              <tr>
                <th className="th-title" colSpan="5">JABATAN</th>
                <td colSpan="7">{data?.department.toUpperCase() || ''}</td>
              </tr>
              <tr>
                <th className="th-title" colSpan="5">NO. PROJEK</th>
                <td colSpan="7">{data?.no_project.toUpperCase() || ''}</td>
              </tr>
              <tr>
                <th className="th-title whitespace-nowrap" colSpan="5">NAMA PEMBEKAL/KONTRAKTOR/PENERIMA</th>
                <td colSpan="7">{data?.recipient.toUpperCase() || ''}</td>
              </tr>

              <tr>
                <th className="text-left th-block" colSpan="12">B: MAKLUMAT KEPERLUAN</th>
              </tr>
              <tr>
                <th className="text-center th-detail whitespace-nowrap">BIL</th>
                <th className="text-center th-detail whitespace-nowrap">KOD BAJET</th>
                <th className="text-center th-detail whitespace-nowrap" colSpan="4">BUTIR BEKALAN/PERKHIDMATAN</th>
                <th className="text-center th-detail whitespace-nowrap" colSpan="2">NO. RUJUKAN/INBOIS</th>
                <th className="text-center th-detail whitespace-nowrap">BIL/UNIT</th>
                <th className="text-center th-detail whitespace-nowrap">KOS/UNIT</th>
                <th className="text-center th-detail whitespace-nowrap" colSpan="2">JUMLAH</th>
              </tr>

              {details?.map((detail, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{detail.budget_code || ''}</td>
                  <td colSpan="4">{detail.description || ''}</td>
                  <td colSpan="2">{detail.reference || ""}</td>
                  <td className="text-center">{detail.quantity || ''}</td>
                  <td className="text-right">{formatCurrency(detail.price)}</td>
                  <td className="text-right" colSpan="2">{formatCurrency(detail.total)}</td>
                </tr>
              ))}

              {/* Baris kosong untuk mencapai 15 baris */}
              {Array(15 - details?.length).fill(0).map((_, index) => (
                <tr key={`empty-${index}`}>
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
                <td colSpan="12">&nbsp;</td>
              </tr>
              
              <tr>
                <th className="text-left th-block whitespace-nowrap" colSpan="6">C: PERAKUAN KETUA JABATAN</th>
                <th className="text-left th-block whitespace-nowrap" colSpan="3">D: SEMAKAN PEGAWAI KEWANGAN</th>
                <th className="text-left th-block whitespace-nowrap" colSpan="3">MAKLUMAT BAYARAN</th>
              </tr>
              <tr>
                <td className="text-left align-top" colSpan="6">
                  <ApprovalInfoTable 
                    remarks={history[0]?.remarks}
                    createdBy={history[0]?.created_by}
                    position={history[0]?.position}
                    createdAt={history[0]?.created_at}
                  />
                </td>
                <td className="text-left align-top" colSpan="3">
                  <ApprovalInfoTable 
                    remarks={history[1]?.remarks}
                    createdBy={history[1]?.created_by}
                    position={history[1]?.position}
                    createdAt={history[1]?.created_at}
                  />
                </td>
                <td className="text-left align-top" colSpan="3">
                  <div className="flex flex-col justify-between" style={{ minHeight: '90px' }}>
                    <div className="flex flex-col">
                      {/* <span className="font-medium mb-2">BAYARAN DARIPADA BANK</span> */}
                      {data?.transactions?.map((tx, index) => (
                        <div key={index} className="flex justify-between gap-4">
                          <strong className="whitespace-nowrap">{tx.bank_name || ''}</strong> 
                          <span className="whitespace-nowrap">{formatCurrency(tx.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between gap-4">
                      <strong className="whitespace-nowrap">JUMLAH BAYARAN</strong> 
                      <span className="whitespace-nowrap">
                      {formatCurrency(data?.transactions?.reduce((total, tx) => total + parseFloat(tx.amount || 0), 0) || 0)}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>

              <tr>
                <th className="text-left th-block whitespace-nowrap" colSpan="6">E: PENGESAHAN PEGAWAI</th>
                <th className="text-left th-block whitespace-nowrap" colSpan="6">F: KELULUSAN KETUA JABATAN</th>
              </tr>
              <tr>
                <td className="text-left align-top" colSpan="6">
                  <ApprovalInfoTable 
                    remarks={history[2]?.remarks}
                    createdBy={history[2]?.created_by}
                    position={history[2]?.position}
                    createdAt={history[2]?.created_at}
                  />
                </td>
                <td colSpan="6">
                  <ApprovalInfoTable 
                    remarks={history[3]?.remarks}
                    createdBy={history[3]?.created_by}
                    position={history[3]?.position}
                    createdAt={history[3]?.created_at}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingPreview;

