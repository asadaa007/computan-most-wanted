import { Outlet } from 'react-router-dom';
// import PublicNavbar from '../../components/public/PublicNavbar';
// import PublicFooter from '../../components/public/PublicFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <PublicNavbar /> */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* <PublicFooter /> */}
    </div>
  );
} 