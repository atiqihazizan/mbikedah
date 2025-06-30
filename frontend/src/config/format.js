export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  //   return `RM ${parseFloat(amount).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ms-MY');
};

export const formatDateShort = (dateString) => {
  const [day, month, year] = dateString.split('/');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('ms-MY', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatTitle = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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