import * as glRepository from "../repositories/glRepository.js";

export async function getAccounts(filters) {
  return glRepository.getAccounts(filters);
}

export async function getCashBook(filters) {
  return glRepository.getCashBook(filters);
}

export async function getJournal(filters) {
  return glRepository.getJournal(filters);
}

export async function getLedger(filters) {
  return glRepository.getLedger(filters);
}

export async function getTrialBalance(filters) {
  return glRepository.getTrialBalance(filters);
}

export async function getProfitLoss(filters) {
  const rows = await glRepository.getProfitLoss(filters);

  const income = rows.filter((r) => r.accountType === "I");
  const expenses = rows.filter((r) => r.accountType === "X");

  const totalIncome = income.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  return {
    income,
    expenses,
    summary: { totalIncome, totalExpenses, netProfit },
  };
}

export async function getBalanceSheet(filters) {
  const rows = await glRepository.getBalanceSheet(filters);

  const assets = rows.filter((r) => r.accountType === "A");
  const liabilities = rows.filter((r) => r.accountType === "L");
  const equity = rows.filter((r) => r.accountType === "E");

  const totalAssets = assets.reduce((sum, r) => sum + (r.balance || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, r) => sum + (r.balance || 0), 0);
  const totalEquity = equity.reduce((sum, r) => sum + (r.balance || 0), 0);

  return {
    assets,
    liabilities,
    equity,
    summary: { totalAssets, totalLiabilities, totalEquity },
  };
}
