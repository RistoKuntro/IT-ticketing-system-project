import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getTickets } from '../api/ticketApi';
import { setTickets } from '../store/ticketsSlice';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const { tickets } = useSelector((state: RootState) => state.tickets);

  useEffect(() => {
    getTickets().then(data => dispatch(setTickets(data)));
  }, [dispatch]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Töölaud</h1>
      <div className="grid gap-4">
        {tickets.map(t => (
          <div key={t.id} className="p-4 border rounded">
            <Link to={`/tickets/${t.id}`}>{t.title}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
