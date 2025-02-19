import React, { useEffect, useState } from "react";
import "./print.css";
import MTALogoImg from "../../components/Core/ImgMTA";

function PreviewJenazah({ data }) {
	if(!data?.yrmth) return;
	const { yrmth: YrMth, total, details } = data;

	return (
		<>
			<table
				id="jtable"
				border="0"
				cellPadding="0"
				cellSpacing="0"
				width="692"
				style={{
					borderCollapse: "collapse",
					tableLayout: "fixed",
					width: "519pt",
				}}
			>
				<colgroup>
					<col
						className="x21"
						width="26"
						style={{ background: "none", width: "19.5pt" }}
					/>
					<col width="77" style={{ width: "57.75pt" }} />
					<col width="195" style={{ width: "146.25pt" }} />
					<col width="112" style={{ width: "84pt" }} />
					<col width="47" style={{ width: "41pt" }} />
					<col width="51" style={{ width: "41pt" }} />
					<col width="92" span="2" style={{ width: "69pt" }} />
				</colgroup>
				<tbody>
					<tr >
						<td colSpan="4" rowSpan="4" width="394">
							<MTALogoImg xclass="" />
						</td>
					</tr>
					<tr>
						<td
							colSpan="4"
							className="text-end !font-bold !align-text-top !text-xl"
						>
							SENARAI MAKLUMAT JENAZAH
						</td>
					</tr>
					<tr height="20" style={{ height: "15pt" }}>
						<td height="20" className="x21" style={{ height: "15pt" }}></td>
						<td></td>
						<td>BULAN</td>
						<td className="text-end pl-1">{YrMth}</td>
					</tr>
					<tr height="20" style={{ height: "15pt" }}>
						<td height="20" className="x21" style={{ height: "15pt" }}></td>
						<td></td>
						<td>JUM. BELANJA</td>
						<td className="x36 pl-1" align="right">
							<div className="flex justify-between">
								<span>RM</span>
								<span>{total.toLocaleString("en", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
							</div>
						</td>
					</tr>
					<tr height="20" style={{ height: "15pt" }}>
						<td height="20" className="x21" style={{ height: "15pt" }}></td>
						<td colSpan="7"></td>
					</tr>
					<tr height="28" style={{ height: "21pt" }}>
						<td
							rowSpan="2"
							height="54"
							className="x38"
							style={{
								borderBottom: "1px solid windowtext",
								height: "40.5pt",
							}}
						>
							Bil
						</td>
						<td
							rowSpan="2"
							height="54"
							className="x38"
							style={{
								borderBottom: "1px solid windowtext",
								height: "40.5pt",
							}}
						>
							Tarikh
						</td>
						<td
							rowSpan="2"
							colSpan={2}
							height="54"
							className="x38"
							style={{
								borderBottom: "1px solid windowtext",
								height: "40.5pt",
							}}
						>
							Nama
						</td>
						{/* <td
							rowSpan="2"
							height="54"
							className="x38"
							style={{
								borderBottom: "1px solid windowtext",
								height: "40.5pt",
							}}
						>
							Kawasan
						</td> */}
						<td
							rowSpan="2"
							height="54"
							className="x38"
							style={{ height: "40.5pt" }}
						>
							Lorong
						</td>
						<td
							rowSpan="2"
							height="54"
							className="x38"
							style={{ height: "40.5pt" }}
						>
							Lubang
						</td>
						<td
							colSpan="2"
							className="x41"
							style={{
								borderRight: "1px solid windowtext",
								borderBottom: "1px solid windowtext",
							}}
						>
							Kos Pengurusan
						</td>
					</tr>
					<tr height="28" style={{ height: "21pt" }}>
						<td className="x27">Masjid</td>
						<td className="x27">Hospital</td>
					</tr>
					{details.map(
						({ name, alamat, cost, lubang, lorong, jdate, typId }, i) => (
							<tr key={i} height="24" style={{ height: "18pt" }}>
								<td className="x24 py-1 text-center h-[16.5pt]">{i + 1}</td>
								<td className="x25 py-1">{jdate}</td>
								<td className="x26 py-1 pl-1" colSpan={2}>
									{name}
								</td>
								{/* <td className="x26 py-1">{alamat}</td> */}
								<td className="x24 py-1 text-center">{lorong}</td>
								<td className="x24 py-1 text-center">{lubang}</td>
								<td className="x29 py-1 text-end pr-1">
									{typId == 1 && parseFloat(cost.replace(',','')) > 0 ? cost : ""}
								</td>
								<td className="x29 py-1 text-end pr-1">
									{typId == 2 && parseFloat(cost.replace(',','')) > 0 ? cost : ""}
								</td>
							</tr>
						)
					)}
				</tbody>
			</table>
		</>
	);
}
const JenazahPrint = React.forwardRef((props, ref) => {
	const { data } = props;
	return (
		<div ref={ref} className="flex justify-center px-20 pt-10 pb-5">
			{<PreviewJenazah data={data} />}
		</div>
	);
});

export default JenazahPrint;
