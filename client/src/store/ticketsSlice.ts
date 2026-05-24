import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { Ticket } from '../types';
import * as ticketApi from '../api/ticketApi';

interface FiltersState {
  status?: string;
  priority?: string;
  search?: string;
}

interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  filters: FiltersState;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  selectedTicket: null,
  filters: {},
  total: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (params?: FiltersState) => {
    const response = await ticketApi.getTickets(params);
    return response;
  }
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (id: number) => {
    const response = await ticketApi.getTicket(id);
    return response;
  }
);

export const addTicket = createAsyncThunk(
  'tickets/addTicket',
  async (data: { title: string; description: string }) => {
    const response = await ticketApi.createTicket(data);
    return response;
  }
);

export const editTicket = createAsyncThunk(
  'tickets/editTicket',
  async ({ id, data }: { id: number; data: object }) => {
    const response = await ticketApi.updateTicket(id, data);
    return response;
  }
);

export const removeTicket = createAsyncThunk(
  'tickets/removeTicket',
  async (id: number) => {
    await ticketApi.deleteTicket(id);
    return id;
  }
);

export const addSolution = createAsyncThunk(
  'tickets/addSolution',
  async ({ ticketId, data }: { ticketId: number; data: { content: string } }) => {
    const response = await ticketApi.addSolution(ticketId, data);
    return { ticketId, response };
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = Array.isArray(action.payload?.tickets) ? action.payload.tickets : [];
        state.total = action.payload?.total || state.tickets.length;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Piletite laadimine ebaõnnestus';
      })
      // fetchTicketById
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Pileti laadimine ebaõnnestus';
      })
      // addTicket
      .addCase(addTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.push(action.payload);
        state.total = state.tickets.length;
      })
      .addCase(addTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Pileti loomine ebaõnnestus';
      })
      // editTicket
      .addCase(editTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTicket.fulfilled, (state, action) => {
        state.loading = false;
        const shouldArchive = action.payload?.isArchived;

        state.tickets = shouldArchive
          ? state.tickets.filter(t => t.id !== action.payload.id)
          : state.tickets.map(t => (t.id === action.payload.id ? action.payload : t));

        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(editTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Pileti värskendamine ebaõnnestus';
      })
      // removeTicket
      .addCase(removeTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = state.tickets.filter(t => t.id !== action.payload);
        state.total = state.tickets.length;
        if (state.selectedTicket?.id === action.payload) {
          state.selectedTicket = null;
        }
      })
      .addCase(removeTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Pileti kustutamine ebaõnnestus';
      })
      // addSolution
      .addCase(addSolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSolution.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedTicket?.id === action.payload.ticketId && state.selectedTicket) {
          state.selectedTicket = {
            ...state.selectedTicket,
            responses: [...(state.selectedTicket.responses ?? []), action.payload.response as any],
          } as Ticket;
        }
      })
      .addCase(addSolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lahenduse lisamine ebaõnnestus';
      });
  },
});

// Actions
export const { setFilters, clearFilters, clearSelectedTicket } = ticketsSlice.actions;

// Selectors
export const selectTickets = (state: RootState) => state.tickets.tickets;
export const selectSelectedTicket = (state: RootState) => state.tickets.selectedTicket;
export const selectTicketsLoading = (state: RootState) => state.tickets.loading;
export const selectTicketsError = (state: RootState) => state.tickets.error;
export const selectFilters = (state: RootState) => state.tickets.filters;
export const selectTotal = (state: RootState) => state.tickets.total;

export default ticketsSlice.reducer;
