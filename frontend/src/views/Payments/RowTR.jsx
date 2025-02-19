import { useEffect, useState } from "react";
import { SaveIcon, XIcon } from "lucide-react";
import PropTypes from "prop-types";

export default function RowTR({ FormC, data, idx = false, setChange }) {
  const def = {
    id: 0,
    budget: "",
    desc: "",
    ref: "",
    qty: 0,
    price: "0.00",
    amount: "0.00",
  };
  const [detail, setDetail] = useState(def);

  function onFocus(ev) {
    ev.target.select();
  }

  function inputChange(e, field) {
    const val = e.target.value;
    const newdata = { ...detail, [field]: val };
    setDetail(newdata);
    onUpdate(newdata);
  }

  function currChange(e, field, times) {
    const val = e.target.value;
    const newdata = { ...detail };
    newdata[field] = val;
    newdata.amount = val * newdata[times];
    setDetail(newdata);
    onUpdate(newdata);
  }

  function onSave(e) {
    if (data) return e;
    let _u;
    setChange((e) => ({
      ...e,
      detail: (_u = [...e.detail, { ...detail }]),
      total: _u.reduce((c, a) => c + parseFloat(a.amount), 0),
    }));
    setDetail(def);
  }

  function onUpdate(newData) {
    if (idx === false) return;
    let _u;
    setChange((e) => ({
      ...e,
      detail: (_u = e.detail.map((d, i) => (i === idx ? newData : d))),
      total: _u.reduce((c, a) => c + parseFloat(a.amount), 0),
    }));
  }

  function onDelete() {
    if (idx === false) return;
    let _u;
    setChange((e) => ({
      ...e,
      detail: (_u = e.detail.filter((f, i) => i !== idx)),
      total: _u.reduce((c, a) => c + parseFloat(a.amount), 0),
    }));
  }

  useEffect(() => {
    if (data) setDetail(data);
  }, []);

  return (
    <tr>
      <td className="!pl-7 !pr-2">
        <FormC.text
          value={detail?.budget}
          onChange={(e) => inputChange(e, "budget")}
          option={{ onFocus: onFocus }}
        />
      </td>
      <td className="!px-2">
        <FormC.text
          value={detail?.desc}
          onChange={(e) => inputChange(e, "desc")}
        />
      </td>
      <td className="!px-2">
        <FormC.text
          value={detail?.ref}
          onChange={(e) => inputChange(e, "ref")}
        />
      </td>
      <td className="!px-2">
        <FormC.number
          value={detail?.qty}
          onChange={(e) => currChange(e, "qty", "price")}
          option={{ onFocus: onFocus }}
        />
      </td>
      <td className="!px-2">
        <FormC.currency
          value={detail?.price}
          onChange={(e) => currChange(e, "price", "qty")}
          option={{ onFocus: onFocus }}
        />
      </td>
      <td className="!px-2">
        <FormC.currency value={detail?.amount} option={{ readOnly: true }} />
      </td>
      <td className="!pl-0 !pr-7">
        <div className="flex flex-col">
          {data == undefined && (
            <a
              className="btn btn-xs btn-icon btn-clear btn-primary"
              onClick={onSave}
            >
              <SaveIcon width={20} />
            </a>
          )}
          {data && (
            <a
              className="btn btn-xs btn-icon btn-clear text-danger-700"
              onClick={onDelete}
            >
              <XIcon width={20} />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

RowTR.propTypes = {
  data: PropTypes.object,
  FormC: PropTypes.func,
  setChange: PropTypes.func,
  idx: PropTypes.number,
};
