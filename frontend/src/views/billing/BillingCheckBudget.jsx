import { formatCurrency } from '../../config/format';
import TSelect from '../../components/Core/TSelect';
import TCheck from '../../components/Core/TCheck';

const BillingCheckBudget = ({ billing, setBilling, budgets,processing }) => {
  const handleBudgetChange = (e, item) => {
    const budget = budgets.find(b => b.id === parseInt(e.target.value));
    setBilling({...billing,details: billing.details.map(d => d.id === parseInt(item.id) ? { ...d, budget_id: budget.id, budget_code: budget.code }: d)});
  };
  const getBalBudget = (budget_id) => {
    const budget = budgets.find(b => b.id === parseInt(budget_id));
    return budget ? budget.bdgtotal : 0;
  };
  const handleAcceptChange = (e, item) => {
    setBilling({...billing,details: billing.details.map(d => d.id === parseInt(item.id) ? { ...d, accept: e.target.checked ? 1 : 0 } : d)});
  };
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Butiran Perbelanjaan</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bil</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">Kod Bajet</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Baki Semasa</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantiti</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Harga Seunit (RM)</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Jumlah (RM)</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Terima</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {billing.details?.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-4">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <TSelect list={budgets} keyval="id,code" data={item} field="budget_id" onChange={(e) => handleBudgetChange(e, item)} placeholder="Pilih kod bajet" isDisabled={processing}/>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(getBalBudget(item.budget_id))}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <TCheck className="m-auto" id="accept-item" name="accept-item" checked={item.accept === 1} onChange={(e) => handleAcceptChange(e, item)} disabled={processing}/>
                </td>
              </tr>
            ))}
          </tbody>
          {/* <tfoot>
            <tr>
              <td colSpan="6" className="text-right px-6 py-4 text-sm font-medium text-gray-900">Jumlah Keseluruhan</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(billing.total_amount)}</td>
            </tr>
          </tfoot> */}
        </table>
      </div>
    </div>
  );
};

export default BillingCheckBudget;