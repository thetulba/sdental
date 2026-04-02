import React from 'react';

export const PricesScreen = () => {
  return (
    <div className="py-20 px-6 max-w-4xl mx-auto">
      <h2 className="text-4xl font-headline mb-10 text-center">Our Prices</h2>
      <div className="grid gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-surface-variant flex justify-between items-center">
          <span className="text-lg font-bold">Smile Design</span>
          <span className="text-xl font-bold text-primary">$500</span>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-surface-variant flex justify-between items-center">
          <span className="text-lg font-bold">Dental Implants</span>
          <span className="text-xl font-bold text-primary">$1500</span>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-surface-variant flex justify-between items-center">
          <span className="text-lg font-bold">Orthodontics</span>
          <span className="text-xl font-bold text-primary">$2000</span>
        </div>
      </div>
    </div>
  );
};
