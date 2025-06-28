import {
  Package,
  BarChart3,
  Banknote,
  Code2,
  FilePlus,
  FolderOpen,
  Archive,
  ClipboardCheck,
} from "lucide-react";


export const navigation = [
  // Dashboard
  { 
    text: "Dashboard", 
    to: "/dashboard", 
    icon: <FilePlus size={20} />,
    type: 1,
    menu: "dashboard.view" // Tambahkan permission khusus untuk dashboard
  },
  // Permohonan Bayaran
  { text: "Permohonan Bayaran", to: "", type: 0 },
  {
    text: "Permohonan Baru",
    to: "/applicant/create",
    icon: <FilePlus size={20} />,
    type: 1,
    menu: "applicant.create"
  },
  {
    text: "Masih Aktif",
    to: "/billing/dashboard",
    icon: <FolderOpen size={20} />,
    type: 1,
    menu: "billing.incomplete"
  },
  {
    text: "Arkib",
    to: "/billing/archive",
    icon: <Archive size={20} />,
    type: 1,
    menu: "billing.archive"
  },
  // Ketua Jabatan
  { text: "Ketua Jabatan", to: "", type: 0 },
  {
    text: "Pengesahan Bayaran",
    to: "/billing/hod",
    icon: <ClipboardCheck size={20} />,
    type: 1,
    menu: "billing.hod"
  },

  // Kewangan
  { text: "Kewangan", to: "", type: 0 },
  {
    text: "Tindakan Pegawai Kewangan",
    to: "/finance",
    icon: <Banknote size={20} />,
    type: 1,
    menu: "finance.view"
  },

  // Laporan
  { text: "Laporan Kewangan", to: "", type: 0 },
  { 
    text: "Keseluruhan", 
    to: "/report/all", 
    icon: <BarChart3 size={20} />, 
    type: 1,
    menu: "report.all"
  },
  {
    text: "Induk Penerimaan",
    to: "/report/income",
    icon: <Banknote size={20} />,
    type: 1,
    menu: "report.income"
  },
  {
    text: "Induk Perbelanjaan",
    to: "/report/expense",
    icon: <Banknote size={20} />,
    type: 1,
    menu: "report.expense"
  },
  {
    text: "Perincian Penerimaan",
    to: "/report/income-detail",
    icon: <FilePlus size={20} />,
    type: 1,
    menu: "report.income.detail"
  },
  {
    text: "Perincian Perbelanjaan",
    to: "/report/expense-detail",
    icon: <FilePlus size={20} />,
    type: 1,
    menu: "report.expense.detail"
  },
  {
    text: "Carta Pendapatan Dan Perbelanjaan",
    to: "/report/chart",
    icon: <BarChart3 size={20} />,
    type: 1,
    menu: "report.chart"
  },

  // Tetapan
  { text: "Tetapan", to: "", type: 0 },
  { 
    text: "Bank", 
    to: "/settings/bank", 
    icon: <Banknote size={20} />, 
    type: 1,
    menu: "settings.bank"
  },
  { 
    text: "Kod Kewangan", 
    to: "/settings/code", 
    icon: <Code2 size={20} />, 
    type: 1,
    menu: "settings.code"
  },
  {
    text: "Bajet Kewangan",
    to: "/settings/budget",
    icon: <Package size={20} />,
    type: 1,
    menu: "settings.budget"
  },
];
