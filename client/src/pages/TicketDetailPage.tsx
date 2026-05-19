import { useParams } from 'react-router-dom';

export const TicketDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pileti detailid: {id}</h1>
    </div>
  );
};
