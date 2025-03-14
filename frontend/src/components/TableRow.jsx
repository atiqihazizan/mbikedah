import { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from 'prop-types';

function Table({ columns = [], data = [], loading, onChecked, tOption = {} }) {
  const option = useMemo(() => ({
    headable: true,
    checkable: true,
    ...tOption
  }), [tOption]);

  const [checkedState, setCheckedState] = useState([]);

  useEffect(() => {
    setCheckedState(new Array(data.length).fill(false));
  }, [data]);

  const onCheckHandle = useCallback((position) => {
    setCheckedState(prev => {
      const next = [...prev];
      next[position] = !next[position];
      onChecked?.(next);
      return next;
    });
  }, [onChecked]);

  const renderCell = useCallback((raw, field, render) => {
    if (render) return render(raw);
    return field?.split(",")
      .map(f => f.split(".")
      .reduce((val, key) => val?.[key], raw))
      .join(", ");
  }, []);

  if (loading) return null;

  return (
    <div className={`relative ${option.oClassParent || ''}`}>
      <table className={`w-full text-sm text-left text-gray-600 dark:text-gray-400 ${option.oClassTable || ''}`}>
        {option.headable && (
          <thead className={`text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ${option.oClassThead || ''}`}>
            <tr>
              {option.checkable && <th scope="col" className="w-[64px]" />}
              {columns?.map(({ name, class: cls, nClass }, i) => (
                <th key={i} className={nClass || `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${cls || ''}`}>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {!data.length ? (
            <tr><td colSpan={columns.length + 1} className="text-center py-4 italic">Tiada data dijumpai</td></tr>
          ) : data.map((raw, i) => (
            <tr key={i} className={raw?.class || "bg-white border-b dark:bg-gray-800 dark:border-gray-700"}>
              {option.checkable && (
                <td className="px-6 py-4">
                  <input type="checkbox" checked={checkedState[i]} onChange={() => onCheckHandle(i)} />
                </td>
              )}
              {columns?.map(({ classRow, field, nClassRow, render }, j) => (
                <td key={j} className={nClassRow || `px-6 py-4 ${classRow || ''}`}>
                  {renderCell(raw, field, render)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string,
    nClass: PropTypes.string,
    classRow: PropTypes.string,
    field: PropTypes.string,
    nClassRow: PropTypes.string,
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.array,
  meta: PropTypes.object,
  loading: PropTypes.bool,
  onReload: PropTypes.func,
  onChecked: PropTypes.func,
  tOption: PropTypes.object,
};

export default Table;
