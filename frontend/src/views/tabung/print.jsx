import React from "react";
import MTALogoImg from "../../components/Core/ImgMTA";
import "./printTabung.css";

function PreviewTabung({
	data,
	others = [],
	typeList = [],
	aName = [],
	aMoney = [],
}) {
	const { dateTime, voucher, ttype, total: _total } = data;
	const jenis = ttype ? typeList.find((f) => (f.key == ttype)).value : "";
	const total = new Intl.NumberFormat().format(parseFloat(_total));
	const border1px = "1px solid windowtext";
	const igno = { msoIgnore: "colspan" };
	const hgtSrc = { msoHeightSource: "userset" };
	const hgt18 = { height: "18.75pt" };
	const hgt15 = { height: "15pt" };
	const borderRB = { borderRight: border1px, borderBottom: border1px };
	const borderR = { borderRight: border1px };

	return (
		<>
			<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
			<meta name="ProgId" content="Excel.Sheet" />
			<meta name="Generator" content="Aspose.Cells 24.8" />
			<div id="section">
				<div id="table_0" sheetname="kutipan Jumaat">
					<table
						id="ttable"
						border={0}
						cellPadding={0}
						cellSpacing={0}
						width={614}
						style={{
							borderCollapse: "collapse",
							tableLayout: "fixed",
							width: "460pt",
						}}
					>
						<colgroup>
							<col
								width={46}
								style={{ msoWidthSource: "userset", width: "34.5pt" }}
							/>
							<col
								width={31}
								style={{ msoWidthSource: "userset", width: "23.25pt" }}
							/>
							<col
								width={30}
								style={{ msoWidthSource: "userset", width: "22.5pt" }}
							/>
							<col
								width={32}
								style={{ msoWidthSource: "userset", width: "24pt" }}
							/>
							<col
								width={21}
								span={2}
								style={{ msoWidthSource: "userset", width: "15.75pt" }}
							/>
							<col
								width={26}
								style={{ msoWidthSource: "userset", width: "19.5pt" }}
							/>
							<col
								width={22}
								style={{ msoWidthSource: "userset", width: "16.5pt" }}
							/>
							<col
								width={20}
								style={{ msoWidthSource: "userset", width: "15pt" }}
							/>
							<col
								width={32}
								style={{ msoWidthSource: "userset", width: "24pt" }}
							/>
							<col
								width={29}
								style={{ msoWidthSource: "userset", width: "21.75pt" }}
							/>
							<col
								width={26}
								span={2}
								style={{ msoWidthSource: "userset", width: "19.5pt" }}
							/>
							<col
								width={36}
								style={{ msoWidthSource: "userset", width: "27pt" }}
							/>
							<col width={64} style={{ width: "48pt" }} />
							<col
								width={8}
								style={{ msoWidthSource: "userset", width: "6pt" }}
							/>
							<col
								width={21}
								style={{ msoWidthSource: "userset", width: "15.75pt" }}
							/>
							<col
								width={23}
								style={{ msoWidthSource: "userset", width: "17.25pt" }}
							/>
							<col
								width={30}
								style={{ msoWidthSource: "userset", width: "22.5pt" }}
							/>
							<col
								width={34}
								style={{ msoWidthSource: "userset", width: "25.5pt" }}
							/>
							<col
								width={36}
								style={{ msoWidthSource: "userset", width: "27pt" }}
							/>
						</colgroup>
						<tbody>
							<tr height={51} style={{ ...hgtSrc, height: "38.25pt" }}>
								<td
									height={51}
									width={46}
									style={{
										textAlign: "left",
										height: "38.25pt",
										width: "34.5pt",
										verticalAlign: "top",
									}}
									align="left"
								>
									<span
										style={{
											msoIgnore: "vglayout",
											position: "absolute",
											zIndex: 1,
											marginLeft: 3,
											marginTop: 5,
											width: 321,
											height: 97,
										}}
									>
										<MTALogoImg />
									</span>
									<span style={{ msoIgnore: "vglayout2" }}>
										<table cellPadding={0} cellSpacing={0}>
											<tbody>
												<tr>
													<td
														height={51}
														width={46}
														style={{ height: "38.25pt", width: "34.5pt" }}
													/>
												</tr>
											</tbody>
										</table>
									</span>
								</td>
								<td colSpan={20} width={568} style={{ ...igno }} />
							</tr>
							<tr height={27} style={{ ...hgtSrc, height: "20.25pt" }}>
								<td
									colSpan={14}
									height={27}
									style={{ ...igno, height: "20.25pt" }}
								/>
								<td className="x89">No. Resit</td>
								<td className="x26">:</td>
								<td colSpan={5} className="x37" style={{ ...igno }}>
									{voucher ?? ""}
								</td>
							</tr>
							<tr height={21} style={{ ...hgtSrc, height: "15.75pt" }}>
								<td
									colSpan={14}
									height={21}
									style={{ ...igno, height: "15.75pt" }}
								/>
								<td className="x89">Tabung</td>
								<td className="x26">:</td>
								<td colSpan={5} className="x38" style={{ ...igno }}>
									{jenis}
								</td>
							</tr>
							<tr height={20} style={{ ...hgtSrc, ...hgt15 }}>
								<td colSpan={21} height={20} style={{ ...igno, ...hgt15 }} />
							</tr>
							<tr height={25} style={{ ...hgtSrc, ...hgt18 }}>
								<td
									colSpan={20}
									height={25}
									className="x39"
									style={{ ...hgt18 }}
								>
									MAKLUMAT PEMBUKAAN DAN PENGIRAAN WANG TABUNG MASJID
								</td>
								<td />
							</tr>
							<tr height={13} style={{ ...hgtSrc, height: "9.75pt" }}>
								<td
									colSpan={21}
									height={13}
									style={{ ...igno, height: "9.75pt" }}
								/>
							</tr>
							<tr height={20} style={{ ...hgtSrc, ...hgt15 }}>
								<td colSpan={20}>
									<InfoDate mDate={dateTime} time={"2:00 PM"} typ={ttype} />
								</td>
								<td className="x25" />
							</tr>
							<tr height={12} style={{ ...hgtSrc, height: "9pt" }}>
								<td
									colSpan={21}
									height={12}
									style={{ ...igno, height: "9pt" }}
								/>
							</tr>
							<tr
								height={27}
								className="x25"
								style={{ ...hgtSrc, height: "20.25pt" }}
							>
								<td
									colSpan={10}
									height={25}
									className="x40"
									style={{ ...borderRB, ...hgt18 }}
								>
									JENIS WANG
								</td>
								<td colSpan={4} className="x43" style={{ ...borderR }}>
									KUANTITI
								</td>
								<td colSpan={6} className="x46" style={{ ...borderRB }}>
									JUMLAH (RM)
								</td>
								<td className="x25" />
							</tr>

							{aMoney.map(({ value, name, money }, i) => (
								<tr key={i} height={20} style={{ ...hgtSrc, ...hgt15 }}>
									<td
										colSpan={10}
										height={18}
										className="x49"
										style={{ ...borderRB, height: "13.5pt" }}
									>
										<div className="m-auto w-[130px] px-10">
											<div className="flex justify-around">
												<span>{name.split(" ")[0]}</span>
												<span>{name.split(" ")[1]}</span>
											</div>
										</div>
									</td>
									<td colSpan={4} className="x52" style={{ ...borderRB }}>
										{value > 0
											? new Intl.NumberFormat().format(
													parseFloat(parseInt(value) / money)
											  )
											: ""}
									</td>
									<td colSpan={6} className="x53" style={{ ...borderRB }}>
										{value > 0 && (
											<>
												<div className="flex justify-between px-3">
													<span>RM</span>
													<span>
														{new Intl.NumberFormat().format(parseFloat(value))}
													</span>
												</div>
											</>
										)}
									</td>
									<td />
								</tr>
							))}

							<tr height={20} style={{ ...hgtSrc, ...hgt15 }}>
								<td
									colSpan={14}
									height={18}
									className="x65"
									style={{ ...borderRB, height: "13.5pt" }}
								>
									JUMLAH
								</td>
								<td colSpan={6} className="x66" style={{ ...borderRB }}>
									<div className="flex justify-between px-3">
										<span>RM</span>
										<span>{total}</span>
									</div>
								</td>
								<td />
							</tr>
							<tr height={20} style={{ ...hgtSrc, ...hgt15 }}>
								<td colSpan={21} height={20} style={{ ...igno, ...hgt15 }} />
							</tr>
							<tr height={21} style={{ ...hgtSrc, height: "15.75pt" }}>
								<td
									colSpan={21}
									height={21}
									className="x26"
									style={{ ...igno, height: "15.75pt" }}
								>
									Lain barangan yang bernilai
								</td>
							</tr>
							<tr height={21} style={{ ...hgtSrc, height: "15.75pt" }}>
								<td height={20} className="x27" style={{ ...hgt15 }}>
									Bil
								</td>
								<td colSpan={9} className="x69" style={{ ...borderRB }}>
									Lain-lain
								</td>
								<td colSpan={4} className="x69" style={{ ...borderRB }}>
									Kuantiti
								</td>
								<td colSpan={6} className="x72" style={{ ...borderR }}>
									Catatan
								</td>
								<td />
							</tr>

							{others.map(({ perkara, qty, remark }, i) => (
								<tr key={i} height={20} style={{ ...hgtSrc, ...hgt15 }}>
									<td height={18} className="x22" style={{ height: "13.5pt" }}>
										{i + 1}
									</td>
									<td colSpan={9} className="x73" style={{ ...borderRB }}>
										{perkara}
									</td>
									<td colSpan={4} className="x73" style={{ ...borderRB }}>
										{qty}
									</td>
									<td colSpan={6} className="x76" style={{ ...borderRB }}>
										{remark}
									</td>
									<td />
								</tr>
							))}

							<tr height={20} style={{ ...hgtSrc, ...hgt15 }}>
								<td colSpan={21} height={20} style={{ ...igno, ...hgt15 }} />
							</tr>
							<tr height={21} style={{ ...hgtSrc, height: "15.75pt" }}>
								<td
									colSpan={6}
									height={21}
									className="x21"
									style={{ ...igno, height: "15.75pt" }}
								>
									JUMLAH KESELURUHAN :
								</td>
								<td colSpan={3} className="x77">
									<div className="flex justify-between px-3 font-bold">
										<span>RM &nbsp;</span>
										<span>{total}</span>
									</div>
								</td>
								<td colSpan={12} style={{ ...igno }} />
							</tr>
							<tr height={20} style={{ ...hgtSrc, ...hgt15 }}>
								<td
									colSpan={21}
									height={20}
									className="x21"
									style={{ ...igno, ...hgt15 }}
								/>
							</tr>
							<tr height={20} style={{ ...hgtSrc, ...hgt15 }}>
								<td
									colSpan={14}
									height={18}
									className="x78"
									style={{
										...borderRB,
										height: "13.5pt",
									}}
								>
									Nama Pembuka/Pengira
								</td>
								<td colSpan={6} className="x81" style={{ ...borderRB }}>
									Tandatangan
								</td>
								<td />
							</tr>

							{aName.map((n, idx) => (
								<tr
									key={idx}
									height={34}
									style={{ ...hgtSrc, height: "25.5pt" }}
								>
									<td
										colSpan={14}
										height={32}
										className="x83"
										style={{ ...borderRB, height: "24pt" }}
									>
										{n}
									</td>
									<td colSpan={6} className="x65" style={{ ...borderRB }} />
									<td />
								</tr>
							))}

							<tr height={20} style={{ ...hgtSrc, ...hgt15 }}>
								<td colSpan={21} height={20} style={{ ...igno, ...hgt15 }} />
							</tr>
							<tr height={25} style={{ ...hgtSrc, ...hgt18 }}>
								<td
									colSpan={12}
									height={25}
									className="x87"
									style={{ ...hgt18 }}
								>
									Tandatangan Pengerusi / Timbalan Pengerusi
								</td>
								<td colSpan={9} className="x23" style={{ ...igno }} />
							</tr>
							<tr height={25} style={{ ...hgtSrc, ...hgt18 }}>
								<td height={25} className="x23" style={{ ...hgt18 }}>
									Nama
								</td>
								<td className="x23">:</td>
								<td colSpan={19} className="x23" style={{ ...igno }} />
							</tr>
							<tr height={25} style={{ ...hgtSrc, ...hgt18 }}>
								<td height={25} className="x23" style={{ ...hgt18 }}>
									No. K/P
								</td>
								<td className="x23">:</td>
								<td colSpan={19} className="x23" style={{ ...igno }} />
							</tr>
							<tr height={18} style={{ ...hgtSrc, height: "13.5pt" }}>
								<td
									colSpan={21}
									height={18}
									className="x23"
									style={{ ...igno, height: "13.5pt" }}
								/>
							</tr>
							<tr height={25} style={{ ...hgtSrc, ...hgt18 }}>
								<td
									colSpan={7}
									height={25}
									className="x25"
									style={{ ...igno, ...hgt18, overflow: "hidden" }}
								>
									Tandatanga Penerimaan Bendahari :&nbsp;
								</td>
								<td colSpan={4} className="x88">
									<div className="flex justify-between px-5 font-bold">
										<span>RM</span>
										<span>{total}</span>
									</div>
								</td>
								<td colSpan={10} className="x25" style={{ ...igno }} />
							</tr>
							<tr height={25} style={{ ...hgtSrc, ...hgt18 }}>
								<td
									colSpan={4}
									height={25}
									className="x87"
									style={{ ...hgt18 }}
								>
									Nama
								</td>
								<td colSpan={17} className="x23" style={{ ...igno }} />
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}
function InfoDate({mDate,time,typ}){
	let _date = mDate.split('-')
	if (_date[0].length == 2) _date = [_date[2], _date[1], _date[0]].join("-");
	const days = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
	const dateStr = _date ? new Date(_date).toLocaleDateString().replaceAll("/", "-") : ""
	const dayStr = _date ? days[new Date(_date).getDay()] : ''
	return (
		<div className="flex justify-between">
			<div className="flex w-[117] justify-start">
				<span>Tarikh</span>
				<span className="px-1">:</span>
				<span>{dateStr}</span>
			</div>
			<div className="flex w-[117px] justify-center">
				<span>Hari</span>
				<span className="px-1">:</span>
				<span>{dayStr}</span>
			</div>
			<div className="flex w-[117px] justify-end">
				{typ == 2 && (
					<>
						<span>Time</span>
						<span className="px-1">:</span>
						<span>{time}</span>
					</>
				)}
			</div>
		</div>
	);
}
const TabungPrint = React.forwardRef((props, ref) => {
	const { userCount, typeMoney, data, typeList, others } = props;
	return (
		<div ref={ref} className="flex justify-center px-20 pt-10 pb-5">
			{
				<PreviewTabung
					data={data}
					aName={userCount}
					aMoney={typeMoney}
					typeList={typeList}
					others={others}
				/>
			}
		</div>
	);
});

export default TabungPrint;
