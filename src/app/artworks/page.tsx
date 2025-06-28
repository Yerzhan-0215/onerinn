export default function ArtworksPage() {
  const artworks = [
    { id: 1, title: 'Desert Dream', artist: 'Aisha', price: '₸120,000' },
    { id: 2, title: 'Kazakh Mountains', artist: 'Bekzat', price: '₸95,000' },
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Artworks Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {artworks.map((art) => (
          <div key={art.id} className="border rounded-xl p-4 shadow">
            <div className="h-40 bg-gray-100 mb-4" /> {/* Placeholder for image */}
            <h2 className="text-xl font-semibold">{art.title}</h2>
            <p className="text-gray-500">by {art.artist}</p>
            <p className="text-green-600 font-bold">{art.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
