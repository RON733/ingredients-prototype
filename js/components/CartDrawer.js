// CartDrawer + OrderSuccessModal components
const { useState: useStateCart } = React;

function OrderSuccessModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-3xl p-8 max-w-sm w-full animate-bounce-sm shadow-2xl border border-white/10">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🎉</div>
          <h3 className="text-white font-extrabold text-2xl">Order Placed!</h3>
          <p className="text-white/40 text-sm mt-1 font-mono">{order.id}</p>
        </div>
        <div className="flex flex-col mb-6 bg-white/5 rounded-2xl overflow-hidden">
          {order.items.map(function({ menuItem, qty }) {
            return (
              <div key={menuItem.id} className="flex items-center justify-between py-3 px-4 border-b border-white/5 last:border-0">
                <span className="text-white/80 text-sm">{menuItem.emoji} {qty}× {menuItem.name}</span>
                <span className="text-brand-400 font-bold text-sm">${(menuItem.price * qty).toFixed(2)}</span>
              </div>
            );
          })}
          <div className="flex justify-between py-3 px-4 bg-brand-900/30 text-white font-extrabold">
            <span>Total (incl. tax)</span>
            <span className="text-brand-400">${order.total.toFixed(2)}</span>
          </div>
        </div>
        <button id="btn-order-success-close" onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
          Awesome! 😄
        </button>
      </div>
    </div>
  );
}

function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartTotal, cartCount, removeFromCart, setCartQty, placeOrder, menuWithStatus } = useApp();
  const [showConfirm, setShowConfirm] = useStateCart(false);
  const [lastOrder,   setLastOrder  ] = useStateCart(null);

  const items = Object.entries(cart).filter(function([, q]) { return q > 0; }).map(function([id, qty]) {
    const menuItem = menuWithStatus.find(m => m.id === id);
    return { menuItem, qty };
  }).filter(x => x.menuItem);

  const tax = cartTotal * 0.08;

  const handlePlace = () => {
    const order = placeOrder();
    if (order) { setLastOrder(order); setShowConfirm(true); }
  };

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 animate-slide-in flex flex-col glass border-l border-white/8 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h2 className="text-white font-extrabold text-lg">Your Cart <span className="text-brand-400">({cartCount})</span></h2>
          <button id="btn-close-cart" onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 flex items-center justify-center transition-all text-sm">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3">
              <span className="text-5xl">🛒</span>
              <p className="text-white/40 font-semibold">Your cart is empty</p>
              <p className="text-white/25 text-sm">Add delicious items from the menu!</p>
            </div>
          ) : items.map(function({ menuItem, qty }) {
            const catColor = CATEGORY_COLORS[menuItem.category] || 'from-gray-600 to-gray-700';
            return (
              <div key={menuItem.id} className="glass-card rounded-xl p-3.5 flex items-center gap-3 border border-white/8">
                <div className={'w-12 h-12 rounded-xl bg-gradient-to-br ' + catColor + ' flex items-center justify-center text-2xl shrink-0'}>{menuItem.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{menuItem.name}</p>
                  <p className="text-brand-400 font-bold text-sm">${(menuItem.price * qty).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => removeFromCart(menuItem.id)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-all">−</button>
                  <span className="text-white font-bold text-sm w-5 text-center tabular-nums">{qty}</span>
                  <button onClick={() => setCartQty(menuItem.id, qty + 1)} disabled={qty >= menuItem.portions}
                    className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-400 text-white flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30">+</button>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/8 p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 bg-white/5 rounded-xl p-4">
              <div className="flex justify-between text-white/50 text-sm"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-white/50 text-sm"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-white font-extrabold text-base pt-2 border-t border-white/10">
                <span>Total</span><span className="text-brand-400">${(cartTotal + tax).toFixed(2)}</span>
              </div>
            </div>
            <button id="btn-place-order" onClick={handlePlace}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-extrabold text-base shadow-xl shadow-brand-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
              🎉 Place Order — ${(cartTotal + tax).toFixed(2)}
            </button>
          </div>
        )}
      </div>

      {showConfirm && lastOrder && (
        <OrderSuccessModal order={lastOrder} onClose={() => { setShowConfirm(false); setLastOrder(null); }} />
      )}
    </>
  );
}
