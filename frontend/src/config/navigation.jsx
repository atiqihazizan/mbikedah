import {
  Package,
  BarChart3,
  Banknote,
  Code2,
  FilePlus,
  FolderOpen,
  Archive,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileText,
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
    text: "Ringkasan Bajet", 
    to: "/reports/budget_summary", 
    icon: <PieChart size={20} />, 
    type: 1,
    menu: "report.budget.summary"
  },
  {
    text: "Penyata Hasil dan Belanja",
    to: "/reports/income_statement",
    icon: <BarChart3 size={20} />,
    type: 1,
    menu: "report.income.statement"
  },
  {
    text: "Pecahan Hasil",
    to: "/reports/revenue_breakdown",
    icon: <TrendingUp size={20} />,
    type: 1,
    menu: "report.revenue.breakdown"
  },
  {
    text: "Pecahan Belanja",
    to: "/reports/expense_breakdown",
    icon: <TrendingDown size={20} />,
    type: 1,
    menu: "report.expense.breakdown"
  },
  {
    text: "Laporan Terperinci",
    to: "/report/detail",
    icon: <FileText size={20} />,
    type: 1,
    menu: "report.detail"
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
