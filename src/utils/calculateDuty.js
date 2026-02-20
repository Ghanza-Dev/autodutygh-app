// C:\xampp\htdocs\ghana_auto_hub\frontend\src\utils\calculateDuty.js

export const calculateGhanaDuty = (msrpUSD, year, engineCC, condition = "Used") => {
  const exchangeRate = 12.50; // Current estimated GRA Rate (Changeable)
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // 1. Valuation & Depreciation
  let depreciationRate = 0;
  if (condition !== "New") {
    if (age === 1) depreciationRate = 0.05;
    else if (age === 2) depreciationRate = 0.10;
    else if (age === 3) depreciationRate = 0.15;
    else if (age === 4) depreciationRate = 0.20;
    else if (age >= 5) depreciationRate = 0.50;
  }
  
  const depreciatedAmount = msrpUSD * depreciationRate;
  const hdvCost = msrpUSD - depreciatedAmount;
  const freight = 1000.00; // Standard estimated freight
  const insurance = (hdvCost + freight) * 0.00875;
  const cifUSD = hdvCost + freight + insurance;
  const cifGHS = cifUSD * exchangeRate;
  const fobGHS = hdvCost * exchangeRate; // FOB is just Cost in GHS

  // 2. Import Duty (Base 1)
  const cc = parseFloat(engineCC);
  let dutyRate = 0.10; 
  if (cc < 1.9) dutyRate = 0.05;
  else if (cc >= 3.0) dutyRate = 0.20;
  const importDuty = cifGHS * dutyRate;

  // 3. Base 2 Taxes (Calculated on CIF + Duty)
  const base2 = cifGHS + importDuty;
  const nhil = base2 * 0.025;
  const getFund = base2 * 0.025;
  const vat = base2 * 0.15;

  // 4. Other Standard Levies (Calculated on CIF)
  const ecowas = cifGHS * 0.005;
  const examFee = cifGHS * 0.01;
  const specialImport = cifGHS * 0.02;
  const eximBank = cifGHS * 0.0075;
  const auLevy = cifGHS * 0.002;
  const withholdingTax = cifGHS * 0.01;

  // 5. Network Charges (Calculated on FOB)
  const networkBase = fobGHS * 0.004;
  const networkNhil = networkBase * 0.025;
  const networkGetFund = networkBase * 0.025;
  const networkVat = (networkBase + networkNhil + networkGetFund) * 0.15;

  // 6. Flat Fees
  const certFee = 0.50;
  const shippersFee = 9.00;
  const motiFee = 5.00;
  const disinfectionFee = 35.00 * exchangeRate;

  // 7. Overage Penalty
  let overagePenalty = 0;
  if (age >= 10 && age < 12) overagePenalty = cifGHS * 0.05;
  else if (age >= 12 && age < 15) overagePenalty = cifGHS * 0.20;
  else if (age >= 15) overagePenalty = cifGHS * 0.50;

  // Total (Excluding Withholding tax as per standard dealer quotes)
  const totalTaxes = importDuty + nhil + getFund + vat + ecowas + examFee + specialImport + eximBank + auLevy + networkBase + networkNhil + networkGetFund + networkVat + certFee + shippersFee + motiFee + disinfectionFee + overagePenalty;

  return {
    exchangeRate,
    valuation: {
      msrp: msrpUSD,
      depreciationRate: depreciationRate * 100,
      depreciatedAmount: depreciatedAmount,
      cost: hdvCost,
      freight: freight,
      insurance: insurance,
      cifUSD: cifUSD,
      cifGHS: cifGHS
    },
    taxes: [
      { name: "Import Duty", rate: `${(dutyRate * 100).toFixed(1)}%`, amount: importDuty },
      { name: "National Health Insurance Levy", rate: "2.5%", amount: nhil },
      { name: "Ghana Education Trust Fund Levy", rate: "2.5%", amount: getFund },
      { name: "Import Value Added Tax", rate: "15%", amount: vat },
      { name: "ECOWAS Levy", rate: "0.5%", amount: ecowas },
      { name: "Vehicle Examination Fee", rate: "1%", amount: examFee },
      { name: "Network Charges", rate: "0.4%", amount: networkBase },
      { name: "Network Charges NHIL", rate: "2.5%", amount: networkNhil },
      { name: "Network Charges GETFund", rate: "2.5%", amount: networkGetFund },
      { name: "Network Charges VAT", rate: "15%", amount: networkVat },
      { name: "Withholding Tax on Imports *", rate: "1%", amount: withholdingTax, excluded: true },
      { name: "Special Import Levy", rate: "2%", amount: specialImport },
      { name: "Ghana Export and Import Bank Levy", rate: "0.75%", amount: eximBank },
      { name: "Africa Union Import Levy", rate: "0.2%", amount: auLevy },
      { name: "Vehicle Certification Fee", rate: "GHS 0.50 flat", amount: certFee },
      { name: "Ghana Shippers Authority Fee", rate: "GHS 9.00 flat", amount: shippersFee },
      { name: "MoTI e-ID Fee", rate: "GHS 5.00 flat", amount: motiFee },
      { name: "Disinfection Fee", rate: "USD 35.00 flat", amount: disinfectionFee },
      { name: "Overage Penalty", rate: `${overagePenalty > 0 ? 'Variable' : '0%'}`, amount: overagePenalty },
    ],
    totalPayable: totalTaxes
  };
};