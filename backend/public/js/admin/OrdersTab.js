// OrdersTab component
function OrdersTab() {
  const { orders } = useApp();

  if (!orders.length) return (
    <div className="animate-fade-in glass-card rounded-2xl p-16 text-center border border-white/8">
      <div className="text-5xl mb-4">📋</div>
      <p className="text-white/40 font-semibold">No orders yet</p>
      <p className="text-white/25 text-sm mt-1">Switch to Customer View and place an order!</p>
    </div>
  );

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Live Order Feed · {orders.length} orders</span>
      </div>
      {orders.map(order => {
        const dt      = new Date(order.timestamp);
        const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return (
          <div key={order.id} className="glass-card rounded-2xl p-5 border border-white/8 animate-fade-in">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-lg">🧾</div>
                <div>
                  <p className="text-white font-bold text-sm font-mono">{order.id}</p>
                  <p className="text-white/35 text-xs">{dateStr} at {timeStr}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-brand-400 font-extrabold text-lg">${order.total.toFixed(2)}</p>
                <p className="text-white/30 text-xs">subtotal ${order.subtotal.toFixed(2)} + tax</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {order.items.map(function({ menuItem, qty }) {
                return (
                  <span key={menuItem.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 text-white/65 text-xs font-semibold border border-white/10">
                    {menuItem.emoji} {qty}× {menuItem.name}
                  </span>
                );
              })}
            </div>

            <div className="border-t border-white/8 pt-3">
              <p className="text-white/25 text-xs font-semibold uppercase tracking-wider mb-2">Ingredients consumed</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(order.deductions).map(function([ingId, qty]) {
                  const label = ingId.split('-').map(function(w){ return w[0].toUpperCase() + w.slice(1); }).join(' ');
                  return (
                    <span key={ingId} className="px-2.5 py-1 rounded-full bg-red-900/30 text-red-400 text-[11px] font-semibold border border-red-800/35">
                      −{qty} {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
