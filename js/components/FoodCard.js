// FoodCard component
const { useState: useStateFoodCard } = React;

function FoodCard({ item }) {
  const { addToCart, removeFromCart, cart, menuWithStatus } = useApp();
  const live    = menuWithStatus.find(m => m.id === item.id) || item;
  const qty     = cart[item.id] || 0;
  const isSO    = live.status === 'soldout';
  const [added, setAdded] = useStateFoodCard(false);
  const catColor = CATEGORY_COLORS[item.category] || 'from-gray-600 to-gray-700';

  const handleAdd = () => {
    if (isSO || qty >= live.portions) return;
    addToCart(item.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 700);
  };

  return (
    <div className={'glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 animate-fade-in ' +
      (isSO ? 'opacity-50 grayscale' : 'hover:border-white/20 hover:shadow-2xl hover:-translate-y-1')}>

      {/* Image area */}
      <div className={'relative h-40 bg-gradient-to-br ' + catColor + ' flex items-center justify-center text-6xl select-none overflow-hidden'}>
        <span className="transition-transform duration-500 drop-shadow-2xl">{item.emoji}</span>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={live.status} portions={live.portions} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-surface-700 to-transparent"></div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm leading-snug">{item.name}</h3>
            <p className="text-white/40 text-xs mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
          </div>
          <span className="text-brand-400 font-extrabold text-base shrink-0">${item.price.toFixed(2)}</span>
        </div>

        {/* Recipe pills */}
        <div className="flex flex-wrap gap-1">
          {item.recipe.map(function({ ingredientId, qty: rqty }) {
            const label = ingredientId.split('-').map(function(w){ return w[0].toUpperCase() + w.slice(1); }).join(' ');
            return (
              <span key={ingredientId} className="px-2 py-0.5 rounded-full bg-white/5 text-white/35 text-[10px] border border-white/8">
                {rqty > 1 ? rqty + '× ' : ''}{label}
              </span>
            );
          })}
        </div>

        {/* Cart control */}
        <div className="mt-auto">
          {qty === 0 ? (
            <button
              id={'btn-add-' + item.id}
              disabled={isSO}
              onClick={handleAdd}
              className={'w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ' +
                (isSO
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : added
                    ? 'bg-emerald-600 text-white scale-95'
                    : 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg hover:shadow-brand-500/25')}
            >
              {isSO ? 'Sold Out' : added ? '✓ Added!' : 'Add to Cart'}
            </button>
          ) : (
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-1 border border-white/8">
              <button id={'btn-dec-' + item.id} onClick={() => removeFromCart(item.id)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition-all">−</button>
              <span className="text-white font-bold text-sm tabular-nums">{qty}</span>
              <button id={'btn-inc-' + item.id} onClick={handleAdd} disabled={qty >= live.portions}
                className="w-9 h-9 rounded-lg bg-brand-500 hover:bg-brand-400 text-white font-bold text-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
