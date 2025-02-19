import React, { useEffect, useState } from "react";
import './voucher.css'

function PreviewVoucher({ data }) {
	const { vdate, total, name, description, details } = data;
	const [viewDate ] = useState(()=>{
		const d = vdate.split('-')
		if(d[0].length == 2) return vdate;
		return [d[2], d[1], d[0]].join("-");
	})
	// console.log(data); return;
	const maxArr = 10
	const defArr = Array(maxArr - details.length).fill({ no: '', desc: ``, amount: '' })
	const content = [...details, ...defArr]

	function splitVal(val) {
		if(val.length == 0) return "";
		const totalPrecision = (parseFloat(val) - parseInt(val)) * 100;
		return {
			round: parseInt(val),
			precision: parseInt(totalPrecision) > 0 ? parseInt(totalPrecision) : "",
		};
	}
	return (
		<div className="bg relative text-[10pt] m-0 p-0">
			<div className="absolute top-[88px] left-0 flex flex-col w-full">
				<span className="self-end">{viewDate}</span>
				<span className="mt-[10px] ml-[100px] ">{name}</span>
				<div className="mt-[36px] flex flex-col  border-black h-[228px] ml-[-18px] mr-[-5px]">
					{content.map(({ no, desc, amount }, i) =>
						desc != "" && amount != "" ? (
							<div key={i} className="flex flex-row h-[11%]">
								<span className={`w-[90px] text-center`}>{no}</span>
								<span className={`w-full`}>{desc}</span>
								<span className={`w-[83px] text-right`}>
									{splitVal(amount).round}
								</span>
								<span className={`w-[130px] text-right`}>
									{splitVal(amount).precision}
								</span>
							</div>
						) : (
							<div key={i} className="flex flex-row h-[11%]">
								&nbsp;
							</div>
						)
					)}
				</div>
				<div className="flex flex-row h-[11%]">
					<span className={`w-full`}>&nbsp;</span>
					<span className={`w-[83px] text-right`}>
						{splitVal(total).round}
					</span>
					<span className={`w-[109px] text-right`}>
						{splitVal(total).precision}
					</span>
				</div>
			</div>
		</div>
	);
}
const VoucherPrint = React.forwardRef((props, ref) => {
	const { data } = props;
	return (
		<div ref={ref} className="flex justify-center px-20 pt-10 pb-5">
			{<PreviewVoucher data={data} />}
		</div>
	);
});

export default VoucherPrint;
