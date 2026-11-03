// G Shot Teas — App-wide React Context & State
const { useState, useEffect, useCallback, createContext, useContext, useMemo } = React;

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

function AppProvider({ children }) {
  const [ingredients, setIngredients] = useState(() => {
    try { const s = localStorage.getItem('gst_ingredients'); return s ? JSON.parse(s) : INITIAL_INGREDIENTS; }
    catch { return INITIAL_INGREDIENTS; }
  });
  const [orders, setOrders] = useState(() => {
    try { const s = localStorage.getItem('gst_orders'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [cart, setCart]       = useState({});
  const [toasts, setToasts]   = useState([]);
  const [view, setView]       = useState('customer');
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => { localStorage.setItem('gst_ingredients', JSON.stringify(ingredients)); }, [ingredients]);
  useEffect(() => { localStorage.setItem('gst_orders',     JSON.stringify(orders));      }, [orders]);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);

  const ingredientMap = useMemo(() => {
    const m = {};
    for (const ing of ingredients) m[ing.id] = ing;
    return m;
  }, [ingredients]);

  const getMaxPortions = useCallback((menuItem, ingMap) => {
    let max = Infinity;
    for (const { ingredientId, qty } of menuItem.recipe) {
      const stock = ingMap[ingredientId] ? ingMap[ingredientId].stock : 0;
      max = Math.min(max, Math.floor(stock / qty));
    }
    return max === Infinity ? 0 : max;
  }, []);

  const menuWithStatus = useMemo(() => {
    return MENU_ITEMS.map(item => {
      const portions = getMaxPortions(item, ingredientMap);
      let status = 'available';
      if (portions === 0)    status = 'soldout';
      else if (portions <= 3) status = 'low';
      return Object.assign({}, item, { portions, status });
    });
  }, [ingredients, ingredientMap, getMaxPortions]);

  const addToCart = useCallback((itemId) => {
    const menuItem = MENU_ITEMS.find(m => m.id === itemId);
    setCart(prev => {
      const cur = prev[itemId] || 0;
      const ingMap = {};
      ingredients.forEach(i => { ingMap[i.id] = i; });
      const portions = getMaxPortions(menuItem, ingMap);
      if (cur >= portions) return prev;
      return Object.assign({}, prev, { [itemId]: cur + 1 });
    });
  }, [ingredients, getMaxPortions]);

  const removeFromCart = useCallback((itemId) => {
    setCart(prev => {
      const cur = prev[itemId] || 0;
      if (cur <= 1) { const n = Object.assign({}, prev); delete n[itemId]; return n; }
      return Object.assign({}, prev, { [itemId]: cur - 1 });
    });
  }, []);

  const setCartQty = useCallback((itemId, qty) => {
    const menuItem = MENU_ITEMS.find(m => m.id === itemId);
    setCart(prev => {
      const ingMap = {};
      ingredients.forEach(i => { ingMap[i.id] = i; });
      const portions = getMaxPortions(menuItem, ingMap);
      const clamped = Math.max(0, Math.min(qty, portions));
      if (clamped === 0) { const n = Object.assign({}, prev); delete n[itemId]; return n; }
      return Object.assign({}, prev, { [itemId]: clamped });
    });
  }, [ingredients, getMaxPortions]);

  const placeOrder = useCallback(() => {
    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ menuItem: MENU_ITEMS.find(m => m.id === id), qty }));
    if (!items.length) return null;

    const deductions = {};
    for (const { menuItem, qty } of items) {
      for (const { ingredientId, qty: rqty } of menuItem.recipe) {
        deductions[ingredientId] = (deductions[ingredientId] || 0) + rqty * qty;
      }
    }

    const depleted = [];
    setIngredients(prev => prev.map(ing => {
      const used = deductions[ing.id] || 0;
      const newStock = Math.max(0, ing.stock - used);
      if (newStock === 0 && used > 0) depleted.push(ing.name);
      return Object.assign({}, ing, { stock: newStock });
    }));

    const subtotal = items.reduce((s, { menuItem, qty }) => s + menuItem.price * qty, 0);
    const tax   = subtotal * 0.08;
    const order = {
      id: 'ORD-' + Date.now(),
      timestamp: new Date().toISOString(),
      items, deductions,
      subtotal, tax,
      total: subtotal + tax,
    };
    setOrders(prev => [order, ...prev]);
    setCart({});
    setCartOpen(false);
    addToast('🎉 Order placed! $' + (subtotal + tax).toFixed(2) + ' — Thanks!', 'success');
    if (depleted.length) {
      setTimeout(() => addToast('⚠️ Ran out of: ' + depleted.join(', '), 'warning'), 700);
    }
    return order;
  }, [cart, addToast]);

  const restock = useCallback((ingredientId, amount) => {
    setIngredients(prev => prev.map(ing =>
      ing.id === ingredientId ? Object.assign({}, ing, { stock: ing.stock + amount }) : ing
    ));
    const ing = ingredients.find(i => i.id === ingredientId);
    if (ing) addToast('✅ Restocked ' + ing.name + ' +' + amount, 'success');
  }, [ingredients, addToast]);

  const setStock = useCallback((ingredientId, amount) => {
    setIngredients(prev => prev.map(ing =>
      ing.id === ingredientId ? Object.assign({}, ing, { stock: Math.max(0, amount) }) : ing
    ));
  }, []);

  const resetDemo = useCallback(() => {
    setIngredients(INITIAL_INGREDIENTS);
    setOrders([]);
    setCart({});
    addToast('🔄 Demo data reset!', 'info');
  }, [addToast]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((s, [id, qty]) => {
    const m = MENU_ITEMS.find(x => x.id === id);
    return s + (m ? m.price * qty : 0);
  }, 0);

  return React.createElement(AppCtx.Provider, {
    value: {
      ingredients, ingredientMap, orders,
      cart, cartCount, cartTotal,
      view, setView,
      cartOpen, setCartOpen,
      menuWithStatus,
      addToCart, removeFromCart, setCartQty,
      placeOrder, restock, setStock, resetDemo,
      toasts,
    }
  }, children);
}
