export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-full flex flex-col items-center justify-center bg-slate-900 p-4 overflow-y-auto">
      <div className="w-full max-w-[360px] py-12">
        {children}
      </div>
    </div>
  );
}