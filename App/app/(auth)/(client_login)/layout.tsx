export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-slate-900 flex flex-col items-center justify-start overflow-y-auto">
      {/* pt-5 (20px) je "sweet spot" - dovoljno prostora, a ne gura formu van ekrana na iPhone 5 */}
      <div className="w-full max-w-[400px] pt-5 sm:pt-2 px-4 pb-10">
        {children}
      </div>
    </div>
  );
}