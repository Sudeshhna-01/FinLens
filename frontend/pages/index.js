import Dashboard from '../src/pages/Dashboard';

function HomePage() {
  return <Dashboard />;
}

HomePage.requireAuth = true;

export default HomePage;
