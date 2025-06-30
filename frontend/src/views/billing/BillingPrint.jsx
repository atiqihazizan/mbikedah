import React from 'react';
import { formatCurrency, formatDate, formatTitle } from '../../config/format';
import logoMBI from "../../assets/logo/mbi-head.png"
import apiClient from '../../utils/axios';

const BillingPrint = React.forwardRef(({ billingData, onPrintComplete }, ref) => {
  const agency = {
    name: "MENTERI BESAR KEDAH INCORPORATED",
    address: "Aras 2 Blok A, Wisma Darulaman, 05503 Alor Setar, Kedah Darulaman",
    tel: "04-730 2137 / 731 0122",
    fax: "04-774 4076",
  };

  const generateApprovalInfoTable = (remarks, createdBy, position, createdAt) => {
    return `
      <table class="w-full border-collapse child-table approval-info-table">
        <tbody>
          <tr class="h-10">
            <th class="text-left">ULASAN</th>
            <td>${remarks || ''}</td>
          </tr>
          <tr>
            <th class="text-left">NAMA</th>
            <td>${formatTitle(createdBy) || ''}</td>
          </tr>
          <tr>
            <th class="text-left">JAWATAN</th>
            <td>${formatTitle(position) || ''}</td>
          </tr>
          <tr>
            <th class="text-left">TARIKH</th>
            <td>${formatDate(createdAt) || ''}</td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const handlePrint = async () => {
    try {
      
      await apiClient.post(`/billings/${billingData?.id}/record-print`);
      const printContent = generatePrintContent();
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(printContent);
      doc.close();
      
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        document.body.removeChild(iframe);
        
        // if (onPrintComplete) {
        //   onPrintComplete();
        // }
      }, 500);
    } catch (error) {
      console.error("Error printing:", error);
    }
  };

  const generatePrintContent = () => {
    const details = billingData?.details?.filter(detail => detail.accept === 1) || [];
    const history = billingData?.history?.filter((h) => h.old_status > 0)?.sort((a, b) => a.old_status - b.old_status) || [];

    return `
      <html>
        <head>
          <title>Print - ${billingData?.running_no}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { padding: 5mm; margin: 0; font-size: 7pt; }
            .table-payment { width: 100%; border-collapse: collapse; }
            .table-payment td, .table-payment th { border: 1px solid; padding: 0.3rem 0.5rem; }
            .table-payment th { text-align: center; }
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
          </style>
        </head>
        <body>
          <div id="printpage">
            <div class="flex flex-row gap-5 mb-5">
              <div class="w-48 h-20 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                <div style="width: 192px; height: 80px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">
                  <img src="${logoMBI}" alt="Logo MBI" style=" object-fit: contain;">
                </div>
              </div>
              <div class="pt-4 flex flex-col gap-1">
                <h4 class="text-xl font-bold">${agency.name}</h4>
                <span class="text-xs">${agency.address}</span>
                <div class="flex flex-row gap-14 text-xs">
                  <span>Tel : ${agency.tel}</span>
                  <span>Fax : ${agency.fax}</span>
                </div>
              </div>
            </div>

            <table class="table-payment">
              <tbody>
                <tr>
                  <th class="th-block" colspan="12">PERMOHONAN PEMBAYARAN</th>
                </tr>
                <tr>
                  <th class="text-left th-block" colspan="12">A: MAKLUMAT PERMOHONAN</th>
                </tr>
                <tr>
                  <th class="th-title" colspan="5">TARIKH PERMOHONAN</th>
                  <td class="text-left" colspan="4">${formatDate(billingData?.created_at)}</td>
                  <th class="text-center font-bold">NO. SIRI</th>
                  <td colspan="2">${billingData?.running_no || ''}</td>
                </tr>
                <tr>
                  <th class="th-title" colspan="5">PERMOHONAN OLEH</th>
                  <td colspan="7">${billingData?.creator?.name?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <th class="th-title" colspan="5">JABATAN</th>
                  <td colspan="7">${billingData?.department?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <th class="th-title" colspan="5">NO. PROJEK</th>
                  <td colspan="7">${billingData?.no_project?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <th class="th-title whitespace-nowrap" colspan="5">NAMA PEMBEKAL/KONTRAKTOR/PENERIMA</th>
                  <td colspan="7">${billingData?.recipient?.toUpperCase() || ''}</td>
                </tr>

                <tr>
                  <th class="text-left th-block" colspan="12">B: MAKLUMAT KEPERLUAN</th>
                </tr>
                <tr>
                  <th class="text-center th-detail whitespace-nowrap">BIL</th>
                  <th class="text-center th-detail whitespace-nowrap">KOD BAJET</th>
                  <th class="text-center th-detail whitespace-nowrap" colspan="4">BUTIR BEKALAN/PERKHIDMATAN</th>
                  <th class="text-center th-detail whitespace-nowrap" colspan="2">NO. RUJUKAN/INBOIS</th>
                  <th class="text-center th-detail whitespace-nowrap">BIL/UNIT</th>
                  <th class="text-center th-detail whitespace-nowrap">KOS/UNIT</th>
                  <th class="text-center th-detail whitespace-nowrap" colspan="2">JUMLAH</th>
                </tr>
                
                ${details.map((detail, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${detail.budget_code || ''}</td>
                    <td colspan="4">${detail.description || ''}</td>
                    <td colspan="2">${detail.reference || ''}</td>
                    <td class="text-center">${detail.quantity || ''}</td>
                    <td class="text-right">${formatCurrency(detail.price)}</td>
                    <td class="text-right" colspan="2">${formatCurrency(detail.total)}</td>
                  </tr>
                `).join('')}
                
                ${Array(15 - details.length).fill(0).map((_, index) => `
                  <tr>
                    <td class="text-center">&nbsp;</td>
                    <td>&nbsp;</td>
                    <td colspan="4">&nbsp;</td>
                    <td colspan="2">&nbsp;</td>
                    <td class="text-center">&nbsp;</td>
                    <td class="text-right">&nbsp;</td>
                    <td class="text-right" colspan="2">&nbsp;</td>
                  </tr>
                `).join('')}

                <tr>
                  <td colspan="12">&nbsp;</td>
                </tr>
                
                <tr>
                  <th class="text-left th-block whitespace-nowrap" colspan="6">C: PERAKUAN KETUA JABATAN</th>
                  <th class="text-left th-block whitespace-nowrap" colspan="3">D: SEMAKAN PEGAWAI KEWANGAN</th>
                  <th class="text-left th-block whitespace-nowrap" colspan="3">MAKLUMAT BAYARAN</th>
                </tr>
                <tr>
                  <td class="text-left align-top" colspan="6">
                    ${generateApprovalInfoTable(
                      history[0]?.remarks,
                      history[0]?.created_by,
                      history[0]?.position,
                      history[0]?.created_at
                    )}
                  </td>
                  <td class="text-left align-top" colspan="3">
                    ${generateApprovalInfoTable(
                      history[1]?.remarks,
                      history[1]?.created_by,
                      history[1]?.position,
                      history[1]?.created_at
                    )}
                  </td>
                  <td class="text-left align-top" colspan="3">
                    <div class="flex flex-col justify-between" style="min-height: 90px;">
                      <div class="flex flex-col">
                        ${billingData?.transactions?.map(tx => `
                          <div class="flex justify-between gap-4">
                            <strong class="whitespace-nowrap">${tx.bank_name || ''}</strong>
                            <span class="whitespace-nowrap">${formatCurrency(tx.amount)}</span>
                          </div>
                        `).join('') || ''}
                      </div>
                      <div class="flex justify-between gap-4">
                        <strong class="whitespace-nowrap">JUMLAH BAYARAN</strong>
                        <span class="whitespace-nowrap">
                          ${formatCurrency(billingData?.transactions?.reduce((total, tx) => total + parseFloat(tx.amount || 0), 0) || 0)}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <th class="text-left th-block whitespace-nowrap" colspan="6">E: PENGESAHAN PEGAWAI</th>
                  <th class="text-left th-block whitespace-nowrap" colspan="6">F: KELULUSAN KETUA PEGAWAI KEWANGAN</th>
                </tr>
                <tr>
                  <td class="text-left align-top" colspan="6">
                    ${generateApprovalInfoTable(
                      history[2]?.remarks,
                      history[2]?.created_by,
                      history[2]?.position,
                      history[2]?.created_at
                    )}
                  </td>
                  <td colspan="6">
                    ${generateApprovalInfoTable(
                      history[3]?.remarks,
                      history[3]?.created_by,
                      history[3]?.position,
                      history[3]?.created_at
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  // Expose print function melalui ref
  React.useImperativeHandle(ref, () => ({
    print: handlePrint
  }));

  return null; // Tidak render apa-apa
});

BillingPrint.displayName = 'BillingPrint';

export default BillingPrint;