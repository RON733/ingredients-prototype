// ToastContainer component
function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={
            'animate-toast-in pointer-events-auto px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 min-w-[240px] max-w-[380px] ' +
            (t.type === 'success' ? 'bg-emerald-600 text-white' :
             t.type === 'warning' ? 'bg-amber-500 text-white' :
             t.type === 'error'   ? 'bg-red-600 text-white' :
             'bg-surface-600 text-white border border-white/10')
          }
        >{t.msg}</div>
      ))}
    </div>
  );
}
