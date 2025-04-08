import { Outlet } from 'react-router-dom';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;