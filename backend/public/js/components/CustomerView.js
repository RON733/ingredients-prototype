// CustomerView component
const { useState: useStateCV } = React;

function CustomerView() {
  const { menuWithStatus } = useApp();
  const [activeCat, setActiveCat] = useStateCV('All');
  const categories = ['All', ...Array.from(new Set(MENU_ITEMS.map(m => m.category)))];
  const filtered   = activeCat === 'All' ? menuWithStatus : menuWithStatus.filter(m => m.category === activeCat);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-brand-500/15 text-brand-400 text-xs font-bold tracking-widest uppercase border border-brand-500/20 mb-4">
          🧋 Fresh &amp; Made to Order
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
          What are you<br />
          <span className="bg-gradient-to-r from-brand-400 via-amber-400 to-brand-300 bg-clip-text text-transparent">craving today?</span>
        </h2>
        <p className="text-white/35 text-sm">All items tracked live — stock updates the moment you order</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            id={'cat-' + cat.toLowerCase()}
            onClick={() => setActiveCat(cat)}
            className={'shrink-0 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ' +
              (activeCat === cat ? 'bg-brand-500 text-white shadow-lg shadow-brand-900/40' : 'glass text-white/50 hover:text-white/80 hover:bg-white/8')}
          >
            {cat === 'Drinks' ? '🧋 ' : cat === 'Burgers' ? '🍔 ' : cat === 'Pizza' ? '🍕 ' : cat === 'Sides' ? '🍟 ' : ''}{cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(item => <FoodCard key={item.id} item={item} />)}
      </div>

      {/* Live status strip */}
      <div className="mt-10 glass rounded-2xl px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">Live Status</span>
        {menuWithStatus.map(item => (
          <div key={item.id} className="flex items-center gap-1.5 text-xs">
            <span className={'w-2 h-2 rounded-full ' +
              (item.status === 'soldout' ? 'bg-red-500' : item.status === 'low' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400')}></span>
            <span className={'font-medium ' +
              (item.status === 'soldout' ? 'text-white/25' : item.status === 'low' ? 'text-amber-400' : 'text-white/55')}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
