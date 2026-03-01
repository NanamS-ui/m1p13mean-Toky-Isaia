const buildDateMatch = (startDate, endDate) => {
  const match = {};

  if (startDate || endDate) {
    match.created_at = {};

    if (startDate) {
      match.created_at.$gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      match.created_at.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  return match;
};
const getMonthRange = (endDate) => {
  const reference = endDate ? new Date(`${endDate}T23:59:59.999Z`) : new Date();

  
  const currentMonthStart = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const currentMonthEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);

  
  const prevMonthStart = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  const prevMonthEnd = new Date(reference.getFullYear(), reference.getMonth(), 0, 23, 59, 59, 999);

  return {
    currentMonthStart,
    currentMonthEnd,
    prevMonthStart,
    prevMonthEnd
  };
};
module.exports = { buildDateMatch, getMonthRange };