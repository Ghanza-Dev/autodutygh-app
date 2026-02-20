// C:\xampp\htdocs\ghana_auto_hub\frontend\src\components\DutyCalculator.jsx
import { useState, useEffect } from 'react';
import { getOfflinePrice, carMakesAndModels, carYears } from '../utils/carDatabase';
import { calculateGhanaDuty } from '../utils/calculateDuty';
import { Search, Calculator as CalcIcon, Info, CheckCircle2, Printer, Share2, Clock, Factory } from 'lucide-react';

function DutyCalculator() {
  const [searchMode, setSearchMode] = useState('vin'); 
  const [vin, setVin] = useState('');
  
  // Manual State
  const [manualMake, setManualMake] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [manualYear, setManualYear] = useState('');
  const [manualCC, setManualCC] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualCondition, setManualCondition] = useState('Used');
  const [manualFuel, setManualFuel] = useState('Gasoline');

  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
      const saved = localStorage.getItem('autoduty_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveRecentSearch = (vinCode, title) => {
      const newSearch = { vin: vinCode, title };
      const updated = [newSearch, ...recentSearches.filter(s => s.vin !== vinCode)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('autoduty_recent_searches', JSON.stringify(updated));
  };

  const formatMoney = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const decodeVIN = async (searchVin = vin) => {
    const targetVin = searchVin.toUpperCase();
    if (targetVin.length !== 17) { setError("VIN must be exactly 17 characters."); return; }
    
    setVin(targetVin);
    setLoading(true); setError(''); setCarDetails(null);

    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${targetVin}?format=json`);
      const data = await response.json();
      const getVal = (variable) => data.Results.find(r => r.Variable === variable)?.Value;
      
      const make = getVal("Make") || "Unknown";
      const model = getVal("Model") || "Unknown";
      const year = parseInt(getVal("Model Year"));
      const engineCC = getVal("Displacement (L)");
      const manufacturer = getVal("Manufacturer Name");
      const plantCountry = getVal("Plant Country");
      const vehicleType = getVal("Vehicle Type");

      if (!year || isNaN(year)) {
         setError("Could not decode this VIN fully. Please switch to Expert Mode.");
         setLoading(false); return;
      }

      const price = getOfflinePrice(make, model, year);
      let dutyResults = null;
      if (price && engineCC) { dutyResults = calculateGhanaDuty(price, year, engineCC, "Used"); }

      const details = { 
          vin: targetVin, make, model, year, 
          engineCC: engineCC ? `${parseFloat(engineCC).toFixed(1)} L` : "Unknown", 
          condition: "Used", fuel: getVal("Fuel Type - Primary") || "Gasoline", style: getVal("Body Class") || "SUV/Sedan", origin: plantCountry || "Unknown", 
          manufacturer: manufacturer || "Unknown", vehicleType: vehicleType || "Unknown",
          basePriceUSD: price ? price : null, duty: dutyResults 
      };

      setCarDetails(details);
      saveRecentSearch(targetVin, `${year} ${make} ${model}`);

    } catch (err) { setError("Failed to connect to server."); }
    setLoading(false);
  };

  const handleManualSearch = () => {
    setError(''); setCarDetails(null);
    const year = parseInt(manualYear); const cc = parseFloat(manualCC); const price = parseFloat(manualPrice);
    if (!manualMake || !manualModel || !year || !cc || !price) { setError("Please fill out all required fields."); return; }
    const dutyResults = calculateGhanaDuty(price, year, cc, manualCondition);
    setCarDetails({ make: manualMake, model: manualModel, year: year, engineCC: `${cc.toFixed(1)} L`, condition: manualCondition, fuel: manualFuel, style: "Standard Vehicle", origin: "Global", manufacturer: manualMake, vehicleType: "Passenger Car", basePriceUSD: price, duty: dutyResults });
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (!carDetails || !carDetails.duty) return;
    
    // Notice the link at the bottom. WhatsApp uses this to pull the logo!
    const shareText = `🚗 *AutoDuty GH Official Estimate*\n\n*VIN:* ${carDetails.vin || 'Manual Entry'}\n*Vehicle:* ${carDetails.year} ${carDetails.make} ${carDetails.model}\n*Engine:* ${carDetails.engineCC}\n\n*Customs Value (CIF):* $${formatMoney(carDetails.duty.valuation.cifUSD)}\n*Total Duty Payable:* GHS ${formatMoney(carDetails.duty.totalPayable)}\n\n_Calculate exactly how much your car will cost at the port before you ship!_\n🌐 www.autodutygh.com`;
    
    if (navigator.share) {
      try { await navigator.share({ title: 'Ghana Customs Duty Estimate', text: shareText }); } 
      catch (err) { console.log("Share canceled", err); }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Estimate copied to clipboard!");
    }
  };

  const availableModels = manualMake ? carMakesAndModels[manualMake] : [];

  return (
    <div className="bg-white p-5 md:p-8 rounded-3xl shadow-lg border border-gray-200 w-full relative z-10">
      
      <div className="print:hidden">
          <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
            <Search className="w-7 h-7 text-emerald-700 mr-3" />
            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wide">VIN Search & Duty Calc</h2>
          </div>
          
          <div className="flex mb-6 bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center ${searchMode === 'vin' ? 'bg-white shadow-sm text-emerald-700 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setSearchMode('vin')}>
                VIN Check
            </button>
            <button className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center ${searchMode === 'manual' ? 'bg-white shadow-sm text-emerald-700 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setSearchMode('manual')}>
                Expert Mode
            </button>
          </div>
          
          <div className="flex flex-col space-y-4">
            {searchMode === 'vin' ? (
                <>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input type="text" placeholder="Enter 17-Digit VIN" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} className="flex-1 p-4 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 uppercase focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-mono font-bold tracking-widest text-lg md:text-xl" />
                        <button onClick={() => decodeVIN(vin)} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md flex items-center justify-center text-sm md:text-base">
                            {loading ? "Decoding..." : "Search Vehicle"}
                        </button>
                    </div>
                    {recentSearches.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="text-xs font-bold text-gray-400 flex items-center mr-2"><Clock className="w-3 h-3 mr-1"/> Recent:</span>
                            {recentSearches.map((item, idx) => (
                                <button key={idx} onClick={() => decodeVIN(item.vin)} className="bg-orange-50 text-orange-700 border border-orange-200 text-xs px-3 py-1.5 rounded-full hover:bg-orange-100 font-bold transition-colors">
                                    {item.title}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in text-sm md:text-base">
                    <select value={manualMake} onChange={(e) => { setManualMake(e.target.value); setManualModel(''); }} className="p-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-emerald-600 outline-none"><option value="">Make</option>{Object.keys(carMakesAndModels).map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <select value={manualModel} onChange={(e) => setManualModel(e.target.value)} disabled={!manualMake} className="p-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-emerald-600 outline-none disabled:opacity-50"><option value="">Model</option>{availableModels.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <select value={manualYear} onChange={(e) => setManualYear(e.target.value)} className="p-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-emerald-600 outline-none"><option value="">Year</option>{carYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
                    <select value={manualCondition} onChange={(e) => setManualCondition(e.target.value)} className="p-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-emerald-600 outline-none"><option value="New">Brand New</option><option value="Used">Used</option></select>
                    <input type="number" step="0.1" placeholder="Engine CC (e.g. 2.0)" value={manualCC} onChange={(e) => setManualCC(e.target.value)} className="p-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-emerald-600 outline-none" />
                    <select value={manualFuel} onChange={(e) => setManualFuel(e.target.value)} className="p-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-emerald-600 outline-none"><option value="Gasoline">Gasoline</option><option value="Diesel">Diesel</option><option value="Hybrid">Hybrid</option></select>
                    <div className="md:col-span-2 relative"><span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-bold">$</span><input type="number" placeholder="MSRP / Purchase Price (USD)" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} className="w-full pl-8 p-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-emerald-600 outline-none" /></div>
                    <button onClick={handleManualSearch} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md">Calculate Full Cost</button>
                </div>
            )}
          </div>

          {error && <p className="text-red-600 mt-4 text-sm md:text-base font-medium flex items-center bg-red-50 p-3 rounded-lg border border-red-200"><Info className="w-4 h-4 mr-2"/> {error}</p>}
      </div>

      {carDetails && (
        <div className="mt-8 animate-fade-in bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden font-sans relative print:shadow-none print:border-none print:m-0">
            
            {/* MASSIVE PRINT WATERMARK (Only visible on print) */}
            <div className="hidden print:flex absolute inset-0 items-center justify-center opacity-10 pointer-events-none z-0">
                <img src="/icon.png" alt="Watermark" className="w-96 h-96 object-contain grayscale" />
            </div>

            {/* Content sits strictly ON TOP of the watermark */}
            <div className="relative z-10">
                
                {/* BRANDED HEADER */}
                <div className="bg-gray-50 p-5 md:p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center text-center md:text-left print:bg-white print:border-b-4 print:border-emerald-900 print:pb-4">
                    <div className="flex items-center mb-4 md:mb-0">
                        {/* Dynamic App Logo Injection */}
                        <div className="w-12 h-12 md:w-16 md:h-16 mr-3 md:mr-4 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none">
                            <img src="/icon.png" alt="AutoDuty GH Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider print:text-black">Official Customs Valuation</p>
                            <h3 className="text-lg md:text-xl font-black text-gray-900 print:text-black">{carDetails.year} {carDetails.make} {carDetails.model}</h3>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                        {carDetails.duty ? (
                            <>
                                <span className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase print:text-black">Total Duty Payable</span>
                                <span className="text-2xl md:text-3xl font-black text-emerald-700 mb-3 print:text-black print:text-4xl">GHS {formatMoney(carDetails.duty.totalPayable)}</span>
                            </>
                        ) : (
                            <span className="text-red-500 font-bold mb-3 text-sm md:text-base">Pricing data not found.</span>
                        )}
                        
                        <div className="flex space-x-2 w-full md:w-auto print:hidden">
                            <button onClick={handleShare} className="flex-1 md:flex-none bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-4 py-2.5 md:py-2 rounded-lg text-sm font-bold flex items-center justify-center shadow-sm transition-colors"><Share2 className="w-4 h-4 mr-2 text-orange-500"/> Share</button>
                            <button onClick={handlePrint} className="flex-1 md:flex-none bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-4 py-2.5 md:py-2 rounded-lg text-sm font-bold flex items-center justify-center shadow-sm transition-colors"><Printer className="w-4 h-4 mr-2 text-emerald-600"/> Print Form</button>
                        </div>
                    </div>
                </div>

                <div className="p-5 md:p-6 space-y-6 md:space-y-8 print:p-0 print:pt-6 bg-transparent">
                    
                    {carDetails.vin && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 md:p-5 print:border-gray-300 print:bg-white bg-opacity-90">
                            <h3 className="text-emerald-900 font-bold mb-3 flex items-center text-sm md:text-base print:text-black"><Factory className="w-4 h-4 md:w-5 md:h-5 mr-2 text-emerald-700 print:hidden"/> Factory & VIN Report</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                                <div><span className="block text-emerald-700 text-[10px] md:text-xs uppercase mb-1 print:text-gray-800">Chassis (VIN) Number</span><span className="font-mono font-bold text-gray-900 print:text-black">{carDetails.vin}</span></div>
                                <div><span className="block text-emerald-700 text-[10px] md:text-xs uppercase mb-1 print:text-gray-800">Manufacturer</span><span className="font-semibold text-gray-900 print:text-black">{carDetails.manufacturer}</span></div>
                                <div><span className="block text-emerald-700 text-[10px] md:text-xs uppercase mb-1 print:text-gray-800">Plant Country</span><span className="font-semibold text-gray-900 print:text-black">{carDetails.origin}</span></div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-gray-800 font-bold mb-3 border-b border-gray-200 pb-2 flex items-center text-sm md:text-base print:border-black print:text-black"><CheckCircle2 className="w-4 h-4 mr-2 text-orange-500 print:hidden"/> Vehicle Specifications</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
                            <div><span className="block text-gray-500 text-[10px] md:text-xs uppercase mb-1 print:text-gray-800">Engine</span><span className="font-semibold text-gray-900 print:text-black">{carDetails.engineCC}</span></div>
                            <div><span className="block text-gray-500 text-[10px] md:text-xs uppercase mb-1 print:text-gray-800">Condition</span><span className="font-semibold text-gray-900 print:text-black">{carDetails.condition}</span></div>
                            <div><span className="block text-gray-500 text-[10px] md:text-xs uppercase mb-1 print:text-gray-800">Fuel Type</span><span className="font-semibold text-gray-900 print:text-black">{carDetails.fuel}</span></div>
                            <div><span className="block text-gray-500 text-[10px] md:text-xs uppercase mb-1 print:text-gray-800">Body Style</span><span className="font-semibold text-gray-900 print:text-black">{carDetails.style}</span></div>
                        </div>
                    </div>

                    {carDetails.duty && (
                        <>
                            <div>
                                <h3 className="text-gray-800 font-bold mb-3 border-b border-gray-200 pb-2 flex items-center text-sm md:text-base print:border-black print:text-black"><CheckCircle2 className="w-4 h-4 mr-2 text-orange-500 print:hidden"/> Value & Logistics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100 bg-opacity-90 print:bg-white print:border-none print:p-0">
                                    <div><span className="block text-gray-500 text-[10px] md:text-xs uppercase print:text-gray-800">MSRP / HDV</span><span className="font-medium text-gray-900 print:text-black">${formatMoney(carDetails.duty.valuation.msrp)}</span></div>
                                    <div><span className="block text-gray-500 text-[10px] md:text-xs uppercase print:text-gray-800">Depreciated Cost</span><span className="font-medium text-gray-900 print:text-black">${formatMoney(carDetails.duty.valuation.cost)} <span className="text-gray-400 text-[10px] print:text-black">(-{carDetails.duty.valuation.depreciationRate}%)</span></span></div>
                                    <div><span className="block text-gray-500 text-[10px] md:text-xs uppercase print:text-gray-800">Freight + Ins.</span><span className="font-medium text-gray-900 print:text-black">${formatMoney(carDetails.duty.valuation.freight + carDetails.duty.valuation.insurance)}</span></div>
                                    <div><span className="block text-gray-500 text-[10px] md:text-xs uppercase print:text-gray-800">Base CIF (USD)</span><span className="font-bold text-gray-900 print:text-black">${formatMoney(carDetails.duty.valuation.cifUSD)}</span></div>
                                </div>
                                <p className="text-right text-[10px] md:text-xs text-gray-500 mt-2 font-medium print:text-black">Applied Exchange Rate: 1 USD = GHS {carDetails.duty.exchangeRate.toFixed(3)}</p>
                            </div>

                            <div>
                                <h3 className="text-gray-800 font-bold mb-3 border-b border-gray-200 pb-2 flex items-center text-sm md:text-base print:border-black print:text-black"><CheckCircle2 className="w-4 h-4 mr-2 text-orange-500 print:hidden"/> Tax Breakdown</h3>
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-opacity-90 bg-white print:border-black print:rounded-none">
                                    <table className="w-full text-left text-xs md:text-sm text-gray-700 print:text-black">
                                        <thead className="bg-gray-100 text-[10px] md:text-xs uppercase text-gray-600 font-bold border-b border-gray-200 print:bg-white print:border-black print:text-black">
                                            <tr><th className="px-3 md:px-4 py-2 md:py-3">Levy / Tax Name</th><th className="px-3 md:px-4 py-2 md:py-3 text-center">Rate</th><th className="px-3 md:px-4 py-2 md:py-3 text-right">Amount (GHS)</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                                            {carDetails.duty.taxes.map((tax, idx) => (
                                                <tr key={idx} className={`${tax.excluded ? 'text-gray-400 line-through print:text-gray-400' : ''}`}>
                                                    <td className="px-3 md:px-4 py-2 md:py-3 font-medium">{tax.name}</td><td className="px-3 md:px-4 py-2 md:py-3 text-center text-gray-500 print:text-black">{tax.rate}</td><td className="px-3 md:px-4 py-2 md:py-3 text-right font-mono text-gray-900 print:text-black">{formatMoney(tax.amount)}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-emerald-50 font-black text-gray-900 border-t-2 border-emerald-200 print:bg-white print:border-black print:text-black">
                                                <td colSpan="2" className="px-3 md:px-4 py-4 md:py-5 text-right uppercase tracking-wider text-xs md:text-sm">Net Taxes Payable:</td><td className="px-3 md:px-4 py-4 md:py-5 text-right text-lg md:text-xl text-emerald-700 print:text-black">GHS {formatMoney(carDetails.duty.totalPayable)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-orange-50 p-3 md:p-4 rounded-xl border border-orange-200 text-[10px] md:text-xs text-orange-800 space-y-2 bg-opacity-90 print:bg-white print:border-gray-400 print:text-black">
                                <p><strong>GRA Disclaimer:</strong> This is an estimate based on current ICUMS valuation formulas, but final duty may vary based on the official weekly Customs Exchange Rate.</p>
                            </div>
                        </>
                    )}
                    
                    {/* Official Print Footer */}
                    <div className="hidden print:block text-center mt-8 border-t-2 border-emerald-900 pt-4 text-xs font-bold text-gray-800">
                        Generated securely by AutoDuty GH • www.autodutygh.com
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default DutyCalculator;