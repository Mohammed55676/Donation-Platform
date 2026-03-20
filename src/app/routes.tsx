import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Donations } from './pages/Donations';
import { DonationDetails } from './pages/DonationDetails';
import { AddDonation } from './pages/AddDonation';
import { Dashboard } from './pages/Dashboard';
import { Volunteer } from './pages/Volunteer';
import { Requests } from './pages/Requests';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'donations', Component: Donations },
      { path: 'donations/:id', Component: DonationDetails },
      { path: 'add-donation', Component: AddDonation },
      { path: 'dashboard', Component: Dashboard },
      { path: 'volunteer', Component: Volunteer },
      { path: 'requests', Component: Requests },
      { path: '*', Component: NotFound },
    ],
  },
]);
