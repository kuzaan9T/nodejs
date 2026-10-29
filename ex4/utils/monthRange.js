const getMonthRange = (month) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  const [year, m] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, m - 1, 1)),
    end: new Date(Date.UTC(year, m, 1))
  };
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

module.exports = { getMonthRange, currentMonth };
