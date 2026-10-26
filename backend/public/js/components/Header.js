// Header component
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

function Header() {
  const { view, setView, cartCount, cartOpen, setCartOpen, resetDemo } = useApp();
  const [cartAnim, setCartAnim] = useStateH(false);
  const prevCount = useRefH(cartCount);

  useEffectH(() => {
    if (cartCount > prevCount.current) {
      setCartAnim(true);
      setTimeout(() => setCartAnim(false), 450);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xl glow-orange select-none">
            🧋
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none tracking-tight">G Shot Teas</p>
            <p className="text-white/30 text-[10px] font-medium tracking-widest uppercase">Live Kitchen</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center glass rounded-2xl p-1 gap-1">
          <button
            id="btn-customer-view"
            onClick={() => setView('customer')}
            className={'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ' +
              (view === 'customer' ? 'bg-brand-500 text-white shadow-lg glow-orange' : 'text-white/50 hover:text-white/80')}
          >
            Customer View
          </button>
          <button
            id="btn-admin-view"
            onClick={() => setView('admin')}
            className={'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ' +
              (view === 'admin' ? 'bg-brand-500 text-white shadow-lg glow-orange' : 'text-white/50 hover:text-white/80')}
          >
            Admin / Kitchen
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-reset-demo"
            onClick={resetDemo}
            title="Reset demo data"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all text-xs font-semibold"
          >
            🔄 Reset
          </button>
          {view === 'customer' && (
            <button
              id="btn-cart-toggle"
              onClick={() => setCartOpen(o => !o)}
              className={'relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ' +
                (cartOpen ? 'bg-brand-600 text-white' : 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30') +
                (cartAnim ? ' animate-cart-pulse' : '')}
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-extrabold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
