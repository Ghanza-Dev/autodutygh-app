// C:\xampp\htdocs\ghana_auto_hub\frontend\src\utils\carDatabase.js

export const popularCars = {
  "TOYOTA": { "RAV4": { 2018: 24510, 2019: 25650, 2020: 25950 }, "CAMRY": { 2018: 23495, 2019: 24095, 2020: 24425 }, "COROLLA": { 2018: 18600, 2019: 18700, 2020: 19600 } },
  "HONDA": { "CIVIC": { 2018: 18940, 2019: 19450, 2020: 19850 }, "CR-V": { 2018: 24250, 2019: 24350, 2020: 25050 } },
  "HYUNDAI": { "ELANTRA": { 2018: 16950, 2019: 17100, 2020: 18950 }, "SONATA": { 2018: 22050, 2019: 22500, 2020: 23600 } }
};

export const getOfflinePrice = (make, model, year) => {
  try { return popularCars[make.toUpperCase()][model.toUpperCase()][year]; } 
  catch (error) { return null; }
};

// MASSIVE 31-Brand Database
export const carMakesAndModels = {
    "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Land Cruiser", "Land Cruiser Prado", "Yaris", "Hilux", "C-HR", "Vitz", "Avalon", "Tacoma", "Tundra", "Sienna", "4Runner", "Prius", "Sequoia", "Venza", "Crown"],
    "Honda": ["Civic", "Accord", "CR-V", "Pilot", "HR-V", "Fit", "Odyssey", "Ridgeline", "Passport", "City"],
    "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder", "Versa", "Navara", "Patrol", "Maxima", "Murano", "Armada", "Kicks", "Qashqai", "Juke", "X-Trail", "Titan"],
    "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Accent", "Kona", "Palisade", "Venue", "Creta", "Ioniq", "Veloster"],
    "Kia": ["Optima", "Sorento", "Sportage", "Forte", "Rio", "Morning/Picanto", "Telluride", "K5", "Soul", "Carnival", "Seltos", "Stinger"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "A-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Wagon (G-Class)", "CLA", "CLS", "EQS"],
    "BMW": ["3 Series", "5 Series", "7 Series", "1 Series", "4 Series", "8 Series", "X1", "X3", "X4", "X5", "X6", "X7", "M3", "M5"],
    "Lexus": ["RX 350", "ES 350", "IS 250", "IS 350", "GX 460", "LX 570", "LX 600", "NX 300", "UX 200", "LS 500"],
    "Ford": ["F-150", "Escape", "Explorer", "Edge", "Mustang", "Ranger", "Expedition", "Bronco", "EcoSport", "Fusion", "Focus"],
    "Chevrolet": ["Silverado", "Equinox", "Malibu", "Tahoe", "Suburban", "Camaro", "Corvette", "Traverse", "Colorado", "Cruze", "Spark"],
    "Volkswagen": ["Golf", "Passat", "Tiguan", "Touareg", "Jetta", "Polo", "Atlas", "Arteon", "ID.4"],
    "Audi": ["A3", "A4", "A6", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron", "TT"],
    "Mazda": ["Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-9", "MX-5 Miata"],
    "Subaru": ["Outback", "Forester", "Crosstrek", "Impreza", "Legacy", "Ascent", "WRX"],
    "Mitsubishi": ["Outlander", "Pajero", "Lancer", "Eclipse Cross", "Mirage", "Triton/L200", "ASX"],
    "Suzuki": ["Swift", "Vitara", "Jimny", "Baleno", "Ertiga", "Celerio", "Dzire"],
    "Land Rover": ["Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar", "Defender", "Discovery"],
    "Porsche": ["Macan", "Cayenne", "Panamera", "911", "Taycan", "718 Boxster"],
    "Volvo": ["XC90", "XC60", "XC40", "S90", "S60", "V90", "V60"],
    "Jeep": ["Grand Cherokee", "Wrangler", "Cherokee", "Compass", "Renegade", "Gladiator"],
    "Peugeot": ["208", "308", "508", "2008", "3008", "5008"],
    "Renault": ["Clio", "Megane", "Captur", "Kadjar", "Koleos", "Duster"],
    "Fiat": ["500", "Panda", "Tipo", "Ducato"],
    "Chrysler": ["300", "Pacifica", "Voyager"],
    "Dodge": ["Charger", "Challenger", "Durango", "Journey"],
    "Infiniti": ["Q50", "Q60", "QX50", "QX60", "QX80"],
    "Acura": ["MDX", "RDX", "TLX", "ILX", "Integra"],
    "Cadillac": ["Escalade", "XT5", "XT4", "XT6", "CT4", "CT5"],
    "Jaguar": ["F-PACE", "E-PACE", "I-PACE", "XF", "XE", "F-TYPE"],
    "Mini": ["Cooper", "Countryman", "Clubman"],
    "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
    "Maserati": ["Ghibli", "Levante", "Quattroporte", "Grecale"]
};

const currentYear = new Date().getFullYear();
export const carYears = Array.from(new Array(currentYear - 2004), (val, index) => currentYear - index);