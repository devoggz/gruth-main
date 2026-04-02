// src/app/(marketing)/loading.tsx
export default function MarketingLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
