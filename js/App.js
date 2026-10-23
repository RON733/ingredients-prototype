// App root + mount
const { useEffect: useEffectApp } = React;

function App() {
  const { view, cartOpen } = useApp();

  useEffectApp(() => {
    if (cartOpen) document.body.classList.add('no-scroll');
    else          document.body.classList.remove('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, [cartOpen]);

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-pink-600/8 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10">
        <Header />
        <main>
          {view === 'customer' ? <CustomerView /> : <AdminView />}
        </main>
        <CartDrawer />
        <ToastContainer />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(AppProvider, null, React.createElement(App))
);
