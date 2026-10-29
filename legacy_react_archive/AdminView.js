// AdminView wrapper
const { useState: useStateAV } = React;

function AdminView() {
  const [tab, setTab] = useStateAV('inventory');
  const tabs = [
    { id: 'inventory', label: '📦 Inventory' },
    { id: 'recipes',   label: '📋 Recipes'   },
    { id: 'orders',    label: '🧾 Orders'    },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">Kitchen Dashboard</h2>
        <p className="text-white/35 text-sm mt-1">Real-time ingredient tracking &amp; order management</p>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            id={'tab-' + t.id}
            onClick={() => setTab(t.id)}
            className={'px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ' +
              (tab === t.id ? 'bg-brand-500 text-white shadow-lg' : 'glass text-white/50 hover:text-white/80')}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'inventory' && <InventoryTab />}
      {tab === 'recipes'   && <RecipesTab   />}
      {tab === 'orders'    && <OrdersTab    />}
    </div>
  );
}
