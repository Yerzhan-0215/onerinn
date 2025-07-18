export default function BackgroundLogo() {
  return (
    <div className="fixed inset-0 z-0 opacity-10 animate-fade-in bg-center bg-no-repeat bg-contain pointer-events-none"
         style={{ backgroundImage: "url('/images/Oner-logo-GIF.gif')" }}>
    </div>
  );
}