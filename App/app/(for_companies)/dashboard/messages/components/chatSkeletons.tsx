export const ChatSkeleton = () => (
  <div className="space-y-2 p-2">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="p-4 rounded-2xl bg-gray-50 flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-gray-200" />
        <div className="flex-1">
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-2 w-32 bg-gray-100 rounded" />
        </div>
        <div className="w-8 h-2 bg-gray-100 rounded" />
      </div>
    ))}
  </div>
);

export const MessageSkeleton = () => (
  <div className="flex-1 p-6 space-y-6 bg-[#f0f2f5] overflow-y-auto">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
        <div className={`w-2/3 h-16 rounded-2xl animate-pulse ${i % 2 === 0 ? "bg-gray-200" : "bg-white"}`} />
      </div>
    ))}
  </div>
);