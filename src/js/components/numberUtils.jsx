export function formatNumber(num) {
  const roundedNum = Number(num).toFixed(2);
  const parts = roundedNum.split(".");
  const decimalPart = parts[1];
  if (decimalPart === "00") {
    return parts[0];
  } else {
    return roundedNum;
  }
}
