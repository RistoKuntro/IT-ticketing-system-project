// client/src/hooks/useTickets.ts
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  fetchTickets,
  fetchTicketById,
  addTicket,
  editTicket,
  removeTicket,
  addSolution,
  setFilters,
  clearFilters,
  clearSelectedTicket,
  selectTickets,
  selectSelectedTicket,
  selectTicketsLoading,
  selectTicketsError,
  selectFilters,
  selectTotal
} from "../store/ticketsSlice";

export function useTickets() {
  const dispatch = useAppDispatch();

  const tickets = useAppSelector(selectTickets);
  const selectedTicket = useAppSelector(selectSelectedTicket);
  const total = useAppSelector(selectTotal);
  const isLoading = useAppSelector(selectTicketsLoading);
  const error = useAppSelector(selectTicketsError);
  const filters = useAppSelector(selectFilters);

  const loadTickets = (params?: { status?: string; priority?: string; search?: string }) => {
    dispatch(fetchTickets(params));
  };

  const loadTicket = (id: number) => {
    dispatch(fetchTicketById(id));
  };

  const createTicket = (data: { title: string; description: string; priority: string }): Promise<any> => {
    return dispatch(addTicket(data)).unwrap();
  };

  const updateTicket = (id: number, data: object): Promise<any> => {
    return dispatch(editTicket({ id, data })).unwrap();
  };

  const deleteTicket = (id: number): Promise<any> => {
    return dispatch(removeTicket(id)).unwrap();
  };

  const createSolution = (ticketId: number, content: string): Promise<any> => {
    return dispatch(addSolution({ ticketId, data: { content } })).unwrap();
  };

  const changeFilters = (partial: Partial<{ status?: string; priority?: string; search?: string }>) => {
    dispatch(setFilters(partial));
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  const clearTicket = () => {
    dispatch(clearSelectedTicket());
  };

  return {
    tickets,
    selectedTicket,
    total,
    isLoading,
    error,
    filters,
    loadTickets,
    loadTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    createSolution,
    changeFilters,
    resetFilters,
    clearTicket
  };
}