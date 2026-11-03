// InventoryTab — with category filter and menu ingredient inspector
const { useState: useStateIT } = React;

function InventoryTab() {
  const { ingredients, restock, setStock, ingredientMap } = useApp();
  const [customAmts, setCustomAmts]   = useStateIT({});
  const [catFilter,  setCatFilter]    = useStateIT('All');
  const [selectedMenu, setSelectedMenu] = useStateIT('');

  // ── derived
  const allCats    = ['All', ...Array.from(new Set(ingredients.map(i => i.category)))];
  const filtered   = catFilter === 'All' ? ingredients : ingredients.filter(i => i.category === catFilter);
  const inspected  = MENU_ITEMS.find(m => m.id === selectedMenu) || null;

  const getMaxPortionsForItem = (menuItem) => {
    let max = Infinity;
    for (const { ingredientId, qty } of menuItem.recipe) {
      const stock = ingredientMap[ingredientId] ? ingredientMap[ingredientId].stock : 0;
      max = Math.min(max, Math.floor(stock / qty));
    }
    return max === Infinity ? 0 : max;
  };

  const getStatus = (ing) => {
    if (ing.stock === 0)                return { label: 'Out of Stock', cls: 'text-red-400 bg-red-900/40 border-red-700/40' };
    if (ing.stock <= ing.lowThreshold)  return { label: 'Low Stock',    cls: 'text-amber-400 bg-amber-900/40 border-amber-700/40' };
    return { label: 'OK', cls: 'text-emerald-400 bg-emerald-900/40 border-emerald-700/40' };
  };

  const summaryCards = [
    { label: 'Total Ingredients', value: ingredients.length,                                                              icon: '📦', grad: 'from-blue-700/60 to-blue-900/40' },
    { label: 'In Stock',          value: ingredients.filter(i => i.stock > i.lowThreshold).length,                        icon: '✅', grad: 'from-emerald-700/60 to-teal-900/40' },
    { label: 'Low Stock',         value: ingredients.filter(i => i.stock > 0 && i.stock <= i.lowThreshold).length,        icon: '⚠️', grad: 'from-amber-700/60 to-orange-900/40' },
    { label: 'Out of Stock',      value: ingredients.filter(i => i.stock === 0).length,                                   icon: '🚫', grad: 'from-red-700/60 to-rose-900/40' },
  ];

  return (
    <div className="animate-fade-in flex flex-col gap-6">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label} className={'glass-card rounded-2xl p-4 border border-white/8 bg-gradient-to-br ' + c.grad}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider">{c.label}</div>
            <div className="text-white font-extrabold text-3xl mt-0.5">{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── Category filter bar ── */}
      <div className="flex flex-col gap-2">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Filter by Category</p>
        <div className="flex flex-wrap gap-2">
          {allCats.map(cat => (
            <button
              key={cat}
              id={'filter-cat-' + cat.toLowerCase()}
              onClick={() => setCatFilter(cat)}
              className={'px-4 py-2 rounded-xl text-xs font-bold transition-all border ' +
                (catFilter === cat
                  ? 'bg-brand-500 text-white border-brand-500 shadow-lg'
                  : 'glass text-white/50 hover:text-white/80 border-white/8 hover:border-white/20')}
            >
              {cat === 'Meat'    ? '🥩 Meat'    :
               cat === 'Dairy'   ? '🥛 Dairy'   :
               cat === 'Produce' ? '🌿 Produce'  :
               cat === 'Bakery'  ? '🥖 Bakery'  :
               'All Ingredients'}
            </button>
          ))}
          {catFilter !== 'All' && (
            <span className="px-3 py-2 text-xs text-white/40 self-center">
              Showing {filtered.length} of {ingredients.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Ingredient table ── */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                {['Ingredient', 'Category', 'Current Stock', 'Unit', 'Status', 'Restock Actions'].map(h => (
                  <th key={h} className="text-left text-white/35 font-semibold text-xs uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ing => {
                const status    = getStatus(ing);
                const catCls    = CATEGORY_BADGE[ing.category] || 'bg-gray-800 text-gray-400 border-gray-700';
                const customAmt = customAmts[ing.id] != null ? customAmts[ing.id] : 10;
                const barPct    = Math.min(100, (ing.stock / Math.max(ing.stock, 20)) * 100);
                const barColor  = ing.stock === 0 ? 'bg-red-500' : ing.stock <= ing.lowThreshold ? 'bg-amber-400' : 'bg-emerald-400';
                return (
                  <tr key={ing.id} className={'border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ' + (ing.stock === 0 ? 'opacity-60' : '')}>
                    <td className="px-5 py-4 text-white font-semibold">{ing.name}</td>
                    <td className="px-5 py-4">
                      <span className={'inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ' + catCls}>{ing.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div className={'h-full rounded-full transition-all duration-500 ' + barColor} style={{ width: barPct + '%' }} />
                        </div>
                        <input
                          id={'stock-input-' + ing.id}
                          type="number" min="0" value={ing.stock}
                          onChange={e => setStock(ing.id, parseInt(e.target.value) || 0)}
                          className="w-14 bg-white/10 text-white text-center rounded-lg py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/45">{ing.unit}</td>
                    <td className="px-5 py-4">
                      <span className={'inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ' + status.cls}>{status.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button id={'btn-restock-10-' + ing.id} onClick={() => restock(ing.id, 10)}
                          className="px-3 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500/35 text-brand-400 text-xs font-bold transition-all border border-brand-500/25">+10</button>
                        <button id={'btn-restock-50-' + ing.id} onClick={() => restock(ing.id, 50)}
                          className="px-3 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500/35 text-brand-400 text-xs font-bold transition-all border border-brand-500/25">+50</button>
                        <div className="flex items-center gap-1">
                          <input
                            id={'custom-amt-' + ing.id}
                            type="number" min="1" value={customAmt}
                            onChange={e => setCustomAmts(prev => Object.assign({}, prev, { [ing.id]: parseInt(e.target.value) || 1 }))}
                            className="w-14 bg-white/10 text-white text-center rounded-lg py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                          <button id={'btn-restock-custom-' + ing.id} onClick={() => restock(ing.id, customAmt)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/45 text-emerald-400 text-xs font-bold transition-all border border-emerald-600/30">Add</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Menu Ingredient Inspector ── */}
      <div className="glass-card rounded-2xl p-5 border border-white/8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔍</span>
          <div>
            <h3 className="text-white font-bold">Menu Ingredient Inspector</h3>
            <p className="text-white/35 text-xs">Select a menu item to see its full ingredient breakdown and current availability</p>
          </div>
        </div>

        <select
          id="menu-inspector-select"
          value={selectedMenu}
          onChange={e => setSelectedMenu(e.target.value)}
          className="w-full md:w-80 bg-white/10 text-white rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/10 mb-4"
        >
          <option value="">-- Select a menu item to inspect --</option>
          {MENU_ITEMS.map(m => (
            <option key={m.id} value={m.id}>{m.emoji} {m.name} — ${m.price.toFixed(2)}</option>
          ))}
        </select>

        {inspected ? (
          <div className="animate-fade-in">
            {/* Header card */}
            <div className={'flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ' + (CATEGORY_COLORS[inspected.category] || 'from-gray-600 to-gray-700') + ' bg-opacity-20 mb-4 border border-white/10'}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{inspected.emoji}</span>
                <div>
                  <p className="text-white font-extrabold text-lg">{inspected.name}</p>
                  <p className="text-white/60 text-xs">{inspected.category} · ${inspected.price.toFixed(2)}</p>
                </div>
              </div>
              <div className={'px-5 py-3 rounded-xl text-center ' +
                (getMaxPortionsForItem(inspected) === 0 ? 'bg-red-900/60 text-red-300' :
                 getMaxPortionsForItem(inspected) <= 2  ? 'bg-amber-900/60 text-amber-300' :
                 'bg-emerald-900/60 text-emerald-300')}>
                <div className="text-3xl font-extrabold leading-none">{getMaxPortionsForItem(inspected)}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">can make</div>
              </div>
            </div>

            {/* Ingredient breakdown cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inspected.recipe.map(function({ ingredientId, qty: needed }) {
                const ing = ingredientMap[ingredientId];
                if (!ing) return null;
                const maxFromThis = Math.floor(ing.stock / needed);
                const isLimiter  = maxFromThis === getMaxPortionsForItem(inspected);
                const stockColor = ing.stock === 0 ? 'text-red-400' : ing.stock <= ing.lowThreshold ? 'text-amber-400' : 'text-emerald-400';
                const borderCl   = ing.stock === 0 ? 'border-red-700/40 bg-red-900/10' : ing.stock <= ing.lowThreshold ? 'border-amber-600/40 bg-amber-900/10' : 'border-white/8';
                return (
                  <div key={ingredientId} className={'rounded-xl p-4 border ' + borderCl}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80 font-semibold text-sm">{ing.name}</span>
                      {isLimiter && getMaxPortionsForItem(inspected) <= 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-400 border border-amber-700/40 font-bold">Limiting</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Needed</div>
                        <div className="text-white font-bold">{needed}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">In Stock</div>
                        <div className={'font-bold ' + stockColor}>{ing.stock}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Max ×</div>
                        <div className={'font-bold ' + stockColor}>{maxFromThis}</div>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-2 bg-white/10 rounded-full h-1 overflow-hidden">
                      <div
                        className={'h-full rounded-full transition-all duration-500 ' +
                          (ing.stock === 0 ? 'bg-red-500' : ing.stock <= ing.lowThreshold ? 'bg-amber-400' : 'bg-emerald-400')}
                        style={{ width: Math.min(100, (ing.stock / Math.max(ing.stock, 20)) * 100) + '%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
            <span className="text-4xl mb-2">🔍</span>
            <p className="text-white font-medium text-sm">No menu item selected</p>
            <p className="text-white/60 text-xs mt-0.5">Pick one from the dropdown above</p>
          </div>
        )}
      </div>
    </div>
  );
}
