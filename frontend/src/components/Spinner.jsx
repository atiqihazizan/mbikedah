import { useStateContext } from "../contexts/ContextProvider";

export default function Spinner() {
  const { spinner } = useStateContext();
  return (
    <>
      {spinner.show && (
        <div
          className="w-[300px] text-center py-2 px-3 text-gray-700 bg-white rounded-lg shadow-gray-500 shadow-lg fixed top-[50%] z-50 animate-fade-in-down"
          style={{ left: "calc((100% - 300px) / 2)" }}
        >
          {spinner.message}
        </div>
      )}
    </>
  );
}
