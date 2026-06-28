import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function AppLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-content">{children}</main>
      <Footer />
    </div>
  );
}

export default AppLayout;
