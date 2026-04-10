/**
 * Payroll calculation utilities.
 * All monetary values in the app's base currency (no multi-currency conversion here).
 */

/**
 * Parse HH:MM:SS or ISO timestamp pair into decimal hours.
 * @param {string|Date} clockIn
 * @param {string|Date} clockOut
 * @returns {number} hours worked (2 decimal places)
 */
export function calcHoursWorked(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  const diff = new Date(clockOut) - new Date(clockIn); // ms
  if (diff <= 0) return 0;
  return Math.round((diff / 3600000) * 100) / 100;
}

/**
 * Sum hours from an array of timesheet entries.
 * @param {Array} entries — each must have clock_in and clock_out fields
 * @returns {number}
 */
export function totalHours(entries = []) {
  return entries.reduce((sum, e) => sum + calcHoursWorked(e.clock_in, e.clock_out), 0);
}

/**
 * Compute gross pay for a SINGLE pay period.
 * @param {"hourly"|"permanent"} employmentType
 * @param {number} totalHoursWorked
 * @param {number} hourlyRate       — used when type === "hourly"
 * @param {number} monthlySalary    — used when type === "permanent"
 * @param {number} overtimeHours    — hours beyond standard (default 0)
 * @param {number} overtimeMultiplier — default 1.5×
 * @returns {number} gross pay
 */
export function calcGrossPay({
  employmentType,
  totalHoursWorked = 0,
  hourlyRate = 0,
  monthlySalary = 0,
  overtimeHours = 0,
  overtimeMultiplier = 1.5,
}) {
  if (employmentType === "permanent") {
    // Fixed salary regardless of hours; overtime on top if any
    const overtimePay = overtimeHours * (monthlySalary / 160) * overtimeMultiplier;
    return Math.round((monthlySalary + overtimePay) * 100) / 100;
  }

  // Hourly
  const regularHours = Math.max(0, totalHoursWorked - overtimeHours);
  const regular = regularHours * hourlyRate;
  const overtime = overtimeHours * hourlyRate * overtimeMultiplier;
  return Math.round((regular + overtime) * 100) / 100;
}

/**
 * Apply deductions to gross pay and return net pay.
 * @param {number} grossPay
 * @param {Array<{amount: number, is_percentage: boolean}>} deductions
 * @returns {{ totalDeductions: number, netPay: number }}
 */
export function calcNetPay(grossPay, deductions = []) {
  const totalDeductions = deductions.reduce((sum, d) => {
    const amt = d.is_percentage ? (grossPay * d.amount) / 100 : d.amount;
    return sum + amt;
  }, 0);
  const netPay = Math.max(0, grossPay - totalDeductions);
  return {
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
  };
}

/**
 * Determine if hours in a period exceed the standard work week threshold.
 * Standard = 40 h/week. Returns overtime hours beyond that.
 * @param {number} weeklyHours
 * @param {number} standardWeeklyHours — default 40
 * @returns {number} overtime hours
 */
export function calcOvertimeHours(weeklyHours, standardWeeklyHours = 40) {
  return Math.max(0, weeklyHours - standardWeeklyHours);
}

/**
 * Format a decimal hour value as "Xh Ym".
 * e.g. 8.75 → "8h 45m"
 */
export function formatHours(decimalHours) {
  if (!decimalHours && decimalHours !== 0) return "—";
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format currency value consistently across payroll views.
 */
export function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get ISO week number for a given date.
 */
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}

/**
 * Build a date-range label for a pay period.
 * @param {"weekly"|"biweekly"|"monthly"} frequency
 * @param {Date} periodStart
 * @returns {string}
 */
export function payPeriodLabel(frequency, periodStart) {
  const start = new Date(periodStart);
  let end;
  if (frequency === "weekly") {
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  } else if (frequency === "biweekly") {
    end = new Date(start);
    end.setDate(end.getDate() + 13);
  } else {
    // monthly — last day of month
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  }
  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}
