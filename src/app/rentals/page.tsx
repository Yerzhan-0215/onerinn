export default function RentalsPage() {
  const rentals = [
    { id: 1, item: 'Power Bank', price: '₸500/day' },
    { id: 2, item: 'Treadmill', price: '₸2,000/day' },
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Rental Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {rentals.map((rental) => (
          <div key={rental.id} className="border rounded-xl p-4 shadow">
            <div className="h-32 bg-gray-100 mb-4" /> {/* Placeholder for image */}
            <h2 className="text-xl font-semibold">{rental.item}</h2>
            <p className="text-blue-600 font-bold">{rental.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
