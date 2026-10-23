// RecipesTab component
function RecipesTab() {
  const { ingredientMap } = useApp();

  const getMaxPortions = (menuItem) => {
    let max = Infinity;
    for (const { ingredientId, qty } of menuItem.recipe) {
      const stock = ingredientMap[ingredientId] ? ingredientMap[ingredientId].stock : 0;
      max = Math.min(max, Math.floor(stock / qty));
    }
    return max === Infinity ? 0 : max;
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-5">
      {MENU_ITEMS.map(item => {
        const portions   = getMaxPortions(item);
        const borderCls  = portions === 0 ? 'border-red-700/40' : portions <= 2 ? 'border-amber-600/40' : 'border-emerald-700/30';
        const portColor  = portions === 0 ? 'bg-red-900/50 text-red-400' : portions <= 2 ? 'bg-amber-900/50 text-amber-400' : 'bg-emerald-900/50 text-emerald-400';
        const catColor   = CATEGORY_COLORS[item.category] || 'from-gray-600 to-gray-700';
        return (
          <div key={item.id} className={'glass-card rounded-2xl p-5 border ' + borderCls}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={'w-12 h-12 rounded-2xl bg-gradient-to-br ' + catColor + ' flex items-center justify-center text-2xl'}>
                  {item.emoji}
                </div>
                <div>
                  <h3 className="text-white font-bold">{item.name}</h3>
                  <p className="text-white/35 text-xs">{item.category} · ${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className={'text-center px-4 py-2.5 rounded-xl ' + portColor}>
                <div className="text-2xl font-extrabold leading-none">{portions}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">portions</div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/8">
              <div className="bg-white/5 grid grid-cols-4 text-[11px] text-white/35 font-semibold uppercase tracking-wider px-3 py-2">
                <span>Ingredient</span>
                <span className="text-center">Need</span>
                <span className="text-center">Stock</span>
                <span className="text-center">Max×</span>
              </div>
              {item.recipe.map(function({ ingredientId, qty }) {
                const ing = ingredientMap[ingredientId];
                const maxFromThis = ing ? Math.floor(ing.stock / qty) : 0;
                const isLimiting  = maxFromThis === portions && portions <= 2;
                const stockColor  = !ing || ing.stock === 0 ? 'text-red-400' : ing.stock <= ing.lowThreshold ? 'text-amber-400' : 'text-emerald-400';
                return (
                  <div key={ingredientId}
                    className={'grid grid-cols-4 items-center px-3 py-2.5 border-t border-white/5 text-xs ' + (isLimiting ? 'bg-amber-900/15' : '')}>
                    <span className="text-white/70 font-medium flex items-center gap-1">
                      {isLimiting && <span className="text-amber-400">⚠</span>}
                      {ing ? ing.name : ingredientId}
                    </span>
                    <span className="text-center text-white/50">{qty}</span>
                    <span className={'text-center font-bold ' + stockColor}>{ing ? ing.stock : 0}</span>
                    <span className="text-center text-white/40">{maxFromThis}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
