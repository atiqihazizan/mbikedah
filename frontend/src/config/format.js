export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ms-MY');
};

// function formatDate(dateString) {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   if (isNaN(date)) return dateString;
//   return date.toLocaleDateString("ms-MY", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
// }

  // const formatDate = (dateString) => {
  //   if (!dateString) return "-";
  //   const options = { day: "numeric", month: "long", year: "numeric" };
  //   return new Date(dateString).toLocaleDateString("ms-MY", options);
  // };

  // const formatCurrency = (amount) => {
  //   return new Intl.NumberFormat("ms-MY", {
  //     style: "currency",
  //     currency: "MYR",
  //     minimumFractionDigits: 2,
  //   }).format(amount);
  // };