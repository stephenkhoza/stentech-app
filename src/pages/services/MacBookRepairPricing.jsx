import React from 'react';


const MacBookRepairPricing = () => {
  const repairData = [
    { description: "Screen Repair/Replacement", price: "R 1250.00 - R 8500.00" },
    { description: "Battery Replacement", price: "R 450.00 - R 2950.00" },
    { description: "Keyboard Repair", price: "R 450.00 - R 2950.00" },
    { description: "Charging Port Repair (MagSafe/USB-C)", price: "R 450.00 - R 2950.00" },
    { description: "Logic Board Repair", price: "R 450.00 - R 2950.00" },
    { description: "Storage Upgrade/Replacement", price: "R 450.00 - R 2950.00" },
    { description: "RAM Upgrade", price: "R 450.00 - R 2950.00" },
    { description: "macOS Reinstallation/Update", price: "R 450.00 - R 2950.00" },
    { description: "Virus and Malware Removal", price: "R 450.00 - R 2950.00" },
    { description: "Overheating Solutions", price: "R 450.00 - R 2950.00" },
    { description: "Data Recovery", price: "R 450.00 - R 2950.00" },
    { description: "Wi-Fi and Networking Issues", price: "R 450.00 - R 2950.00" },
    { description: "Audio Jack or Speaker Repair", price: "R 450.00 - R 2950.00" },
    { description: "Hinge and Frame Repair", price: "R 450.00 - R 2950.00" },
    { description: "BIOS/UEFI Configuration and Updates", price: "R 450.00 - R 2950.00" }
  ];

  const handleQuoteRequest = () => {
    window.open('https://www.stentech.co.za/book-a-repair', '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fadeIn">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
        MacBook Repair
      </h1>

      <img
        src="/images/apple_Laptop image.jpeg"
        alt="MacBook under repair"
        className="w-full max-w-xl mx-auto rounded-lg shadow-lg mb-8 transition-transform hover:scale-[1.02]"
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-xl rounded-lg bg-white">
          <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
            <tr>
              <th className="text-left px-6 py-4 text-sm md:text-base font-semibold uppercase tracking-wide">
                Fault Description
              </th>
              <th className="text-center px-6 py-4 text-sm md:text-base font-semibold uppercase tracking-wide">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {repairData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 text-gray-700">{item.description}</td>
                <td className="px-6 py-4 text-center font-semibold text-teal-600">{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleQuoteRequest}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg uppercase tracking-wide transition-transform hover:-translate-y-1"
        >
          Request a Quote
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600 max-w-2xl mx-auto">
        Prices may vary depending on your MacBook model and the extent of the damage. Contact us for a detailed quote.
      </p>
    </div>
  );
};

export default MacBookRepairPricing;
