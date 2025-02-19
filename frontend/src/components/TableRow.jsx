import { useEffect, useState, useMemo, useCallback } from "react";
// import { useSearchParams } from "react-router-dom";
import PropTypes from 'prop-types';

// function Table({ columns, data = [], meta, loading, onReload, onChecked, tOption }) {
function Table({ columns, data = [],  loading,  onChecked, tOption }) {
  const option = useMemo(() => ({
    oClassParent: "",
    nClassTable: "",
    oClassTable: "",
    nClassThead: "",
    oClassThead: "",
    headable: true,
    checkable: true,
    ...tOption,
  }), [tOption]);

  // const [searchParams, setSearchParams] = useSearchParams();
  const [checkedState, setCheckedState] = useState(new Array(data.length).fill(false));

  useEffect(() => {
    setCheckedState(new Array(data.length).fill(false));
  }, [data]);

  const onCheckHandle = useCallback((e, position) => {
    setCheckedState((prevState) => {
      const updatedState = [...prevState];
      updatedState[position] = !updatedState[position];
      onChecked?.(updatedState);
      return updatedState;
    });
  }, [onChecked]);

  // const onPageClick = useCallback((link) => {
  //   const pageNum = new URL(link.url).searchParams.get("page");
  //   if (!pageNum || link.active) return;
  //   setSearchParams(`?page=${pageNum}`);
  //   onReload(link.url);
  // }, [onReload, setSearchParams]);

  return (
    <div className={`relative ${option.oClassParent}`}>
      <table className={`w-full text-sm text-left text-gray-600 dark:text-gray-400 ${option.oClassTable}`}>
        {option.headable && (
          <thead className={`text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ${option.oClassThead}`}>
            <tr>
              {option.checkable && <th scope="col" className="w-[64px]"></th>}
              {columns?.map(({ name, class: classes, nClass }, idx) => (
                <th key={idx} className={nClass || `pl-4 py-3 ${classes || ""}`}>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {!loading && (
            data.length === 0 ? (
              <tr>
                <td colSpan={columns?.length + 1 || 1} className="text-center py-4 italic">
                  No Data Record
                </td>
              </tr>
            ) : (
              data.map((raw, idx) => (
                <tr key={idx} className={raw?.class || "bg-white border-b dark:bg-gray-800 dark:border-gray-700"}>
                  {option.checkable && (
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={checkedState[idx]} onChange={(e) => onCheckHandle(e, idx)} />
                    </td>
                  )}
                  {columns?.map(({ classRow, field, nClassRow, render }, colIdx) => (
                    <td key={colIdx} className={nClassRow || `pl-4 py-4 ${classRow || ""}`}>
                      {render ? render(raw) : field?.split(",").map(f => f.split(".").reduce((val, key) => val?.[key], raw)).join(", ")}
                    </td>
                  ))}
                </tr>
              ))
            )
          )}
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
