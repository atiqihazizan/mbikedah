import { useState, useEffect } from "react";
import { FaWallet, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import apiClient from "../../utils/axios";
import BankDialog from "../../components/dialogs/BankDialog";
import TButton from "../../components/Core/TButton";

/**
 * Bank Balance Settings Component (Finance Role Only)
 */
const BankBalanceSettings = ({ isDark, currentUser, onUnsavedChanges }) => {
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const accountTypes = [
    { value: 'current', label: 'Akaun Semasa' },
    { value: 'savings', label: 'Akaun Simpanan' },
    { value: 'fixed_deposit', label: 'Simpanan Tetap' },
    { value: 'investment', label: 'Akaun Pelaburan' }
  ];

  // Load banks data on component mount
  useEffect(() => {fetchBanks();}, []);

  // Filter banks based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBanks(banks);
    } else {
      const filtered = banks.filter(bank => {
        const searchLower = searchTerm.toLowerCase();
        return (
          bank.bank_name?.toLowerCase().includes(searchLower) ||
          bank.bank_account?.toLowerCase().includes(searchLower) ||
          bank.branch_name?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredBanks(filtered);
    }
  }, [banks, searchTerm]);

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get('/banks');
      
      // Handle both direct array response and object with data property
      const banksData = Array.isArray(data) ? data : (data.data || []);
      
      // Add amount field if not exists (for existing banks)
      const banksWithAmount = banksData.map(bank => ({
        ...bank,
        amount: bank.amount || bank.balance || '0.00' // Support both amount and balance fields
      }));
      setBanks(banksWithAmount);
    } catch (error) {
      console.error('Error fetching banks:', error);
      // Set empty array if error occurs
      setBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingBank(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (bank) => {
    setEditingBank(bank);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBank(null);
    onUnsavedChanges(false);
  };

  const handleSaveBank = async (bankData) => {
    setIsSaving(true);
    try {
      let savedBank;
      if (editingBank) {
        // Update existing account
        savedBank = await apiClient.put(`/banks/${editingBank.id}`, bankData);
        setBanks(prev => prev.map(bank => 
          bank.id === editingBank.id ? { ...savedBank, amount: bankData.amount } : bank
        ));
      } else {
        // Create new account
        savedBank = await apiClient.post('/banks', bankData);
        setBanks(prev => [...prev, { ...savedBank, amount: bankData.amount }]);
      }

      closeDialog();
    } catch (error) {
      console.error('Error saving account:', error);
      const errorMessage = error.response?.data?.message || 'Ralat menyimpan maklumat akaun kewangan. Sila cuba lagi.';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Adakah anda pasti untuk memadam akaun kewangan ini?')) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`/banks/${accountId}`);
      setBanks(prev => prev.filter(bank => bank.id !== accountId));
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = error.response?.data?.message || 'Ralat memadam akaun kewangan. Sila cuba lagi.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const calculateTotalBalance = () => {
    return banks.reduce((total, bank) => {
      // Support both amount and balance fields
      const bankAmount = bank.amount || bank.balance || 0;
      return total + parseFloat(bankAmount);
    }, 0).toFixed(2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount || 0);
  };

  // Categorize accounts based on name and account number
  const categorizeAccount = (bank) => {
    const name = bank.bank_name?.toLowerCase() || '';
    
    if (name.includes('tunai')) {
      return {
        type: 'cash',
        label: 'Tunai',
        icon: '💵',
        color: 'bg-green-100 text-green-800'
      };
    } else if (name.includes('panjar') || name.includes('wang runcit')) {
      return {
        type: 'petty_cash',
        label: 'Wang Panjar',
        icon: '💰',
        color: 'bg-yellow-100 text-yellow-800'
      };
    } else if (bank.bank_account) {
      return {
        type: 'bank_account',
        label: 'Akaun Bank',
        icon: '🏦',
        color: 'bg-blue-100 text-blue-800'
      };
    } else {
      return {
        type: 'other',
        label: 'Lain-lain',
        icon: '📝',
        color: 'bg-gray-100 text-gray-800'
      };
    }
  };

  // Group accounts by category (use filtered banks for display)
  const groupedAccounts = {
    bank_account: filteredBanks.filter(bank => categorizeAccount(bank).type === 'bank_account'),
    petty_cash: filteredBanks.filter(bank => categorizeAccount(bank).type === 'petty_cash'),
    cash: filteredBanks.filter(bank => categorizeAccount(bank).type === 'cash'),
    other: filteredBanks.filter(bank => categorizeAccount(bank).type === 'other')
  };

  const calculateCategoryTotal = (accounts) => {
    return accounts.reduce((total, bank) => {
      const bankAmount = bank.amount || bank.balance || 0;
      return total + parseFloat(bankAmount);
    }, 0).toFixed(2);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Maklumat Baki Kewangan
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Urus maklumat akaun bank, wang panjar, dan wang tunai
        </p>
      </div>

      {/* Total Balance Overview with Categories */}
      <div className="mb-6 space-y-4">
        {/* Overall Total */}
        <div className={`p-6 rounded-lg border ${
          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaWallet className={`w-8 h-8 mr-4 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Jumlah Baki Keseluruhan
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Semua akaun ({banks.length} akaun)
                  {searchTerm && (
                    <span className={`ml-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      • Menunjukkan {filteredBanks.length} hasil carian
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                {formatCurrency(calculateTotalBalance())}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
          {/* Bank Accounts */}
          {groupedAccounts.bank_account.length > 0 && (
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🏦</span>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Akaun Bank
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {groupedAccounts.bank_account.length} akaun
                  </p>
                </div>
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {formatCurrency(calculateCategoryTotal(groupedAccounts.bank_account))}
              </p>
            </div>
          )}

          {/* Petty Cash */}
          {groupedAccounts.petty_cash.length > 0 && (
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">💰</span>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Wang Panjar
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {groupedAccounts.petty_cash.length} akaun
                  </p>
                </div>
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {formatCurrency(calculateCategoryTotal(groupedAccounts.petty_cash))}
              </p>
            </div>
          )}

          {/* Cash */}
          {groupedAccounts.cash.length > 0 && (
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">💵</span>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Wang Tunai
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {groupedAccounts.cash.length} akaun
                  </p>
                </div>
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {formatCurrency(calculateCategoryTotal(groupedAccounts.cash))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search and Add New Account Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Cari nama bank, nombor akaun, atau cawangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-10 py-2 text-sm rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <TButton variant="subtle" size="xs" color="ghost" onClick={handleClearSearch} circle={true}>
                <FaTimes className="w-3 h-3" />
              </TButton>
            </div>
          )}
        </div>

        {/* Add New Account Button */}
        <TButton color="primary" size="md" variant="solid" onClick={openAddDialog} isDisable={isLoading}>
          <FaPlus className="w-4 h-4" />
          <span>Tambah Akaun Kewangan Baru</span>
        </TButton>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mb-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredBanks.length === 0 ? (
              <>Tiada hasil ditemui untuk "<span className="font-medium">{searchTerm}</span>"</>
            ) : (
              <>Menunjukkan {filteredBanks.length} daripada {banks.length} akaun untuk "<span className="font-medium">{searchTerm}</span>"</>
            )}
          </p>
        </div>
      )}

      {/* Accounts List */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-38rem)] ">
        {filteredBanks.length === 0 && !isLoading ? (
          <div className={`p-6 rounded-lg border text-center ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? (
                <>
                  Tiada akaun kewangan ditemui yang sepadan dengan carian anda.
                  <br />
                  <TButton variant="link" color="primary" size="sm" onClick={handleClearSearch} className="mt-2">
                    Kosongkan carian
                  </TButton>
                </>
              ) : (
                <>Tiada maklumat akaun kewangan. Klik "Tambah Akaun Kewangan Baru" untuk memulakan.</>
              )}
            </p>
          </div>
        ) : (
          filteredBanks.map((bank) => {
            const category = categorizeAccount(bank);
            return (
              <div key={bank.id} className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{category.icon}</span>
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {bank.bank_name}
                      </h3>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${category.color}`}>
                        {category.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Show account number only if exists */}
                      {bank.bank_account && (
                        <div>
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Nombor Akaun:
                          </span>
                          <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {bank.bank_account}
                          </p>
                        </div>
                      )}
                      
                      {/* Show account type for categorization */}
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Jenis:
                        </span>
                        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {category.label}
                        </p>
                      </div>

                      {bank.branch_name && (
                        <div>
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Cawangan:
                          </span>
                          <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {bank.branch_name}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Baki Semasa:
                      </span>
                      <p className={`text-xl font-bold ${
                        parseFloat(bank.amount || bank.balance || 0) > 0 
                          ? (isDark ? 'text-green-400' : 'text-green-600')
                          : (isDark ? 'text-gray-400' : 'text-gray-500')
                      }`}>
                        {formatCurrency(bank.amount || bank.balance || 0)}
                      </p>
                      {bank.amount && bank.balance && bank.amount !== bank.balance && (
                        <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          (Balance field: {formatCurrency(bank.balance)})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <TButton
                      variant="subtle"
                      color="blue"
                      size="sm"
                      onClick={() => openEditDialog(bank)}
                      isDisable={isLoading}
                      circle={true}
                    >
                      <FaEdit className="w-4 h-4" />
                    </TButton>
                    <TButton
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => handleDeleteAccount(bank.id)}
                      isDisable={isLoading}
                      circle={true}
                    >
                      <FaTrash className="w-4 h-4" />
                    </TButton>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isLoading && banks.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Memuatkan maklumat kewangan...
          </span>
        </div>
      )}

      {/* BANK DIALOG - INI YANG HILANG DALAM KOD ASAL! */}
      <BankDialog isOpen={isDialogOpen} onClose={closeDialog} onSave={handleSaveBank} bank={editingBank} isDark={isDark} isLoading={isSaving}/>
    </div>
  );
};

export default BankBalanceSettings;