import { cloneElement, createContext } from "react";
import Table from "./TableRow";

const CardContext = createContext();

function Card({ children, className }) {
	return (
		<div className={`card ${className}`}>
			<CardContext.Provider value={false}>{children}</CardContext.Provider>
		</div>
	);
}

function Header({ children, title }) {
	return (
		<div className="card-header">
			<h3 className="card-title">{title}</h3>
			{children}
		</div>
	);
}

function Footer({ children, oClass, title }) {
	return <div className={[`card-footer`, oClass].join(" ")}>{children}</div>;
}

function Body({ children, oClass }) {
	const classes = ["card-body", oClass];
	return <div className={classes.join(" ")}>{children}</div>;
}
function CustTable({ children, oClass,tableCss }) {
	const classes = ["card-table", oClass];
  const cssTable =['table',tableCss]
	return (
    <div className={classes.join(" ")}>
      <table className={cssTable.join(" ")}>{children}</table>
    </div>
  );
}
function CTable({ children, oClass, columns, data, oOption = {} }) {
	const classes = ["card-table scrollable-x-auto pb-3", oClass];
	const option = {
		nClassTable: "table text-left",
		nClassThead: false,
		...oOption,
	};
	return (
		<div className={classes.join(" ")}>
			<Table columns={columns} data={data} tOption={option} />
		</div>
	);
}

Card.Header = Header;
Card.Footer = Footer;
Card.Body = Body;
Card.CTable = CTable;
Card.Table = CustTable;
export default Card;
