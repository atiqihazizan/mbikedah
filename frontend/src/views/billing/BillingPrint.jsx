import React, { useCallback, useEffect, useRef, useState } from 'react';
import { formatCurrency, formatDate, formatTitle } from '../../config/format';
import { toast } from 'react-toastify';
import logoMBI from "../../assets/logo/mbi-head.png"
import apiClient from '../../utils/axios';

const PRINT_STATUS = 5;
const PRINT_ACTION = 'process';
const MIN_DETAIL_ROWS = 15;
const PRINT_DELAY = 500;

const BillingPrint = React.forwardRef(({ billingId, onPrintComplete }, ref) => {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const abortControllerRef = useRef(null);

  const agency = {
    name: "MENTERI BESAR KEDAH INCORPORATED",
    address: "Aras 2 Blok A, Wisma Darulaman, 05503 Alor Setar, Kedah Darulaman",
    tel: "04-730 2137 / 731 0122",
    fax: "04-774 4076",
  };

  const generateApprovalInfoTable = useCallback((approval) => {
    const { remarks = '', created_by = '', position = '', created_at = '' } = approval || {};
    
    return `
      <table class="w-full border-collapse child-table approval-info-table">
        <tbody>
          <tr class="h-10">
            <th class="text-left">ULASAN</th>
            <td>${remarks}</td>
          </tr>
          <tr>
            <th class="text-left">NAMA</th>
            <td>${formatTitle(created_by)}</td>
          </tr>
          <tr>
            <th class="text-left">JAWATAN</th>
            <td>${formatTitle(position)}</td>
          </tr>
          <tr>
            <th class="text-left">TARIKH</th>
            <td>${formatDate(created_at)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }, []);

  // Initialize - load data for the first time
  const initialize = useCallback(async (targetBillingId, shouldPrintAfter = false) => {
    if (!targetBillingId) {
      setError('ID bil tidak diberikan');
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    setBillingData(null);
    setPendingPrint(shouldPrintAfter);
    
    try {
      const { data } = await apiClient.post(`/status-validation/validate`, {
          billing_id: targetBillingId, 
          status: PRINT_STATUS, 
          action: PRINT_ACTION
        }, { signal: abortControllerRef.current.signal });
      
      if (!data) throw new Error('Tiada data yang diterima');
      
      setBillingData(data);
      setInitialized(true);
      
      // Auto print if requested
      if (shouldPrintAfter) {
        setPendingPrint(false);
        setTimeout(() => handlePrintInternal(data), 200);
      }
      
    } catch (error) {
      if (error.name === 'AbortError') return;
      
      const errorMessage = error.response?.data?.message || error.message || "Ralat semasa mendapatkan maklumat bil";
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Reset when billingId changes
  useEffect(() => {
    if (billingId) {
      setInitialized(false);
      setBillingData(null);
      setError(null);
    }
  }, [billingId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const generatePrintContent = useCallback((data) => {
    if (!data) return '';

    const details = data.details?.filter(detail => detail.accept === 1) || [];
    const history = data.history?.filter((h) => h.old_status > 0)?.sort((a, b) => a.old_status - b.old_status) || [];
    const totalPayment = data.transactions?.reduce((total, tx) => total + parseFloat(tx.amount || 0), 0) || 0;
    const detailRows = [...details];
    while (detailRows.length < MIN_DETAIL_ROWS) detailRows.push({});

    return `
      <html>
        <head>
          <title>Print - ${billingData?.running_no}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { padding: 5mm; margin: 0; font-size: 7pt; }
            .table-payment { width: 100%; border-collapse: collapse; cell-spacing: 0; cell-padding: 0; }
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
                  <th class="th-title whitespace-nowrap" colspan="5">TARIKH PERMOHONAN</th>
                  <td class="text-left" colspan="4">${formatDate(data.created_at)}</td>
                  <th class="text-center font-bold">NO. SIRI</th>
                  <td colspan="2">${data.running_no || ''}</td>
                </tr>
                
                <tr>
                  <th class="th-title whitespace-nowrap" colspan="5">PERMOHONAN OLEH</th>
                  <td colspan="7">${(data.creator?.name || '').toUpperCase()}</td>
                </tr>
                
                <tr>
                  <th class="th-title whitespace-nowrap" colspan="5">JABATAN</th>
                  <td colspan="7">${(data.department || '').toUpperCase()}</td>
                </tr>
                
                <tr>
                  <th class="th-title whitespace-nowrap" colspan="5">NO. PROJEK</th>
                  <td colspan="7">${(data.no_project || '').toUpperCase()}</td>
                </tr>
                
                <tr>
                  <th class="th-title whitespace-nowrap" colspan="5">NAMA PEMBEKAL/KONTRAKTOR/PENERIMA</th>
                  <td colspan="7">${(data.recipient || '').toUpperCase()}</td>
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
                
                ${detailRows.map((detail, index) => `
                  <tr>
                    <td class="text-center">${detail.budget_code ? index + 1 : '&nbsp;'}</td>
                    <td class="text-center">${detail.budget_code || '&nbsp;'}</td>
                    <td colspan="4">${detail.description || '&nbsp;'}</td>
                    <td colspan="2">${detail.reference || '&nbsp;'}</td>
                    <td class="text-center">${detail.quantity || '&nbsp;'}</td>
                    <td class="text-right">${detail.price ? formatCurrency(detail.price) : '&nbsp;'}</td>
                    <td class="text-right" colspan="2">${detail.total ? formatCurrency(detail.total) : '&nbsp;'}</td>
                  </tr>
                `).join('')}

                <tr><td colspan="12">&nbsp;</td></tr>
                
                <tr>
                  <th class="text-left th-block whitespace-nowrap" colspan="6">C: PERAKUAN KETUA JABATAN</th>
                  <th class="text-left th-block whitespace-nowrap" colspan="3">D: SEMAKAN PEGAWAI KEWANGAN</th>
                  <th class="text-left th-block whitespace-nowrap" colspan="3">MAKLUMAT BAYARAN</th>
                </tr>
                
                <tr>
                  <td class="text-left align-top" colspan="6">
                    ${generateApprovalInfoTable(history[0])}
                  </td>
                  <td class="text-left align-top" colspan="3">
                    ${generateApprovalInfoTable(history[1])}
                  </td>
                  <td class="text-left align-top" colspan="3">
                    <div class="flex flex-col justify-between" style="min-height: 90px;">
                      <div class="flex flex-col">
                        ${data.transactions?.map(tx => `
                          <div class="flex justify-between gap-4 text-[8px]">
                            <span class="whitespace-nowrap font-bold">${tx.bank_name || ''}</span>
                            <span class="whitespace-nowrap">${formatCurrency(tx.amount)}</span>
                          </div>
                        `).join('') || ''}
                      </div>
                      <div class="flex justify-between gap-4">
                        <strong>JUMLAH BAYARAN</strong>
                        <span><strong>${formatCurrency(totalPayment)}</strong></span>
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
                    ${generateApprovalInfoTable(history[2])}
                  </td>
                  <td class="text-left align-top" colspan="6">
                    ${generateApprovalInfoTable(history[3])}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  }, [generateApprovalInfoTable]);

  const handlePrintInternal = useCallback((data) => {
    const printData = data || billingData;
    
    if (!printData) {
      toast.error("Tiada maklumat untuk dicetak");
      return;
    }

    try {
      const printContent = generatePrintContent(printData);
      const iframe = document.createElement("iframe");
      iframe.style.cssText = `
        position: absolute;
        width: 0;
        height: 0;
        border: none;
        visibility: hidden;
      `;
      
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(printContent);
      doc.close();
      
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          setTimeout(() => {
            if (document.body.contains(iframe)) apiClient.post(`/billings/${billingData?.id}/record-print`).then(() => document.body.removeChild(iframe));
            if (onPrintComplete) onPrintComplete();
          }, 1000);
        } catch (printError) {
          console.error("Error printing", printError);
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }
      }, PRINT_DELAY);
      
    } catch (error) {
      console.error("Error generating print content", error);
    }
  }, [billingData, generatePrintContent, onPrintComplete]);

  // Main print function
  const handlePrint = useCallback(() => {
    if (loading) {
      toast.warning("Sila tunggu data selesai dimuat");
      return;
    }

    if (error) {
      toast.error("Ralat: " + error);
      return;
    }

    if (!billingData) {
      // If no data, initialize and print
      if (billingId) {
        initialize(billingId, true);
      } else {
        toast.error("ID bil tidak sah");
      }
      return;
    }

    handlePrintInternal();
  }, [loading, error, billingData, billingId, initialize, handlePrintInternal]);

  // Refresh/reload data function
  const refreshData = useCallback(() => {
    if (billingId) initialize(billingId, false);
  }, [billingId, initialize]);

  // Print with fresh data
  const printWithFreshData = useCallback(() => {
    if (billingId) initialize(billingId, true);
    else toast.error("ID bil tidak sah");
  }, [billingId, initialize]);

  React.useImperativeHandle(ref, () => ({
    print: handlePrint,
    printWithFreshData: printWithFreshData,
    initialize: initialize,
    refreshData: refreshData,
    isReady: !loading && !error && !!billingData && initialized,
    isLoading: loading,
    hasError: !!error,
    billingData,
    initialized
  }), [handlePrint, printWithFreshData, initialize, refreshData, loading, error, billingData, initialized]);

  return null;
});

BillingPrint.displayName = 'BillingPrint';

export default BillingPrint;