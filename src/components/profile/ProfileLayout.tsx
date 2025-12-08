import Sidebar from './Sidebar';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-3 py-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3">
          <Sidebar />
        </div>
        <div className="col-span-12 md:col-span-9">
          {children}
        </div>
      </div>
    </div>
  );
}
