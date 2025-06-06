import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN';
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  city: string;
  rentPerMonth: number;
  landlordId: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  createdAt: string;
  tenant: { id: string; name: string; email: string };
  property: { id: string; title: string; city: string; rentPerMonth: number };
  payment:
    | { status: 'PENDING' | 'SUCCESS' | 'FAILED'; amount: number; paidAt: string | null }
    | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  tenant: { id: string; name: string };
  property: { id: string; title: string };
}

export interface Metrics {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalReviews: number;
  totalRevenue: number;
}

export interface UsersPaginationMeta {
  totalUsers: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertiesPaginationMeta {
  totalProperties: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingsPaginationMeta {
  totalBookings: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewsPaginationMeta {
  totalReviews: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminState {
  users: User[];
  usersPage: number;
  usersLimit: number;
  usersTotal: number;
  usersTotalPages: number;

  properties: Property[];
  propertiesPage: number;
  propertiesLimit: number;
  propertiesTotal: number;
  propertiesTotalPages: number;

  bookings: Booking[];
  bookingsPage: number;
  bookingsLimit: number;
  bookingsTotal: number;
  bookingsTotalPages: number;

  reviews: Review[];
  reviewsPage: number;
  reviewsLimit: number;
  reviewsTotal: number;
  reviewsTotalPages: number;

  metrics: Metrics | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  usersPage: 1,
  usersLimit: 10,
  usersTotal: 0,
  usersTotalPages: 1,

  properties: [],
  propertiesPage: 1,
  propertiesLimit: 10,
  propertiesTotal: 0,
  propertiesTotalPages: 1,

  bookings: [],
  bookingsPage: 1,
  bookingsLimit: 10,
  bookingsTotal: 0,
  bookingsTotalPages: 1,

  reviews: [],
  reviewsPage: 1,
  reviewsLimit: 10,
  reviewsTotal: 0,
  reviewsTotalPages: 1,

  metrics: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<
  { data: User[]; meta: UsersPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>(
  'admin/fetchUsers',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/users?page=${page}&limit=${limit}`);
      return response.data as { data: User[]; meta: UsersPaginationMeta };
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

export const changeUserRole = createAsyncThunk<
  { user: User; token: string },
  { userId: string; role: 'TENANT' | 'LANDLORD' | 'ADMIN' },
  { rejectValue: string }
>(
  'admin/changeUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/${userId}/role`, { role });
      return response.data as { user: User; token: string };
    } catch (err: unknown) {
      let message = 'Failed to change role';
      if (axios.isAxiosError(err) && err.response) {
        message = (err.response.data as { error?: string }).error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      return userId;
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

export const fetchProperties = createAsyncThunk<
  { data: Property[]; meta: PropertiesPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>(
  'admin/fetchProperties',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/properties?page=${page}&limit=${limit}`);
      return response.data as { data: Property[]; meta: PropertiesPaginationMeta };
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

export const deletePropertyByAdmin = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteProperty',
  async (propertyId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/properties/${propertyId}`);
      return propertyId;
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

export const fetchBookings = createAsyncThunk<
  { data: Booking[]; meta: BookingsPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>(
  'admin/fetchBookings',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/bookings?page=${page}&limit=${limit}`);
      return response.data as { data: Booking[]; meta: BookingsPaginationMeta };
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk<
  Booking,
  { bookingId: string; status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' },
  { rejectValue: string }
>(
  'admin/updateBookingStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/bookings/${bookingId}/status`, { status });
      return response.data as Booking;
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

export const fetchReviews = createAsyncThunk<
  { data: Review[]; meta: ReviewsPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>(
  'admin/fetchReviews',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/reviews?page=${page}&limit=${limit}`);
      return response.data as { data: Review[]; meta: ReviewsPaginationMeta };
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

export const deleteReview = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/reviews/${reviewId}`);
      return reviewId;
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

export const fetchMetrics = createAsyncThunk<Metrics, void, { rejectValue: string }>(
  'admin/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/metrics');
      return response.data as Metrics;
    } catch (error: unknown) {
      let message: string;
      if (axios.isAxiosError(error) && error.response) {
        message = (error.response.data as { error?: string }).error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUsers.fulfilled,
      (state, action: PayloadAction<{ data: User[]; meta: UsersPaginationMeta }>) => {
        state.loading = false;
        state.users = action.payload.data;
        state.usersPage = action.payload.meta.page;
        state.usersLimit = action.payload.meta.limit;
        state.usersTotal = action.payload.meta.totalUsers;
        state.usersTotalPages = action.payload.meta.totalPages;
      }
    );
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load users';
    });

    builder.addCase(changeUserRole.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(changeUserRole.fulfilled, (state, action) => {
      const updatedUser = action.payload.user;
      const index = state.users.findIndex((u) => u.id === updatedUser.id);
      if (index !== -1) {
        state.users[index] = updatedUser;
      }
    });

    builder.addCase(changeUserRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to update user role';
    });

    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.usersTotal = Math.max(0, state.usersTotal - 1);
      state.usersTotalPages = Math.ceil(state.usersTotal / state.usersLimit);
      if (state.usersPage > state.usersTotalPages && state.usersTotalPages > 0) {
        state.usersPage = 1;
      }
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to delete user';
    });

    builder.addCase(fetchProperties.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchProperties.fulfilled,
      (state, action: PayloadAction<{ data: Property[]; meta: PropertiesPaginationMeta }>) => {
        state.loading = false;
        state.properties = action.payload.data;
        state.propertiesPage = action.payload.meta.page;
        state.propertiesLimit = action.payload.meta.limit;
        state.propertiesTotal = action.payload.meta.totalProperties;
        state.propertiesTotalPages = action.payload.meta.totalPages;
      }
    );
    builder.addCase(fetchProperties.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load properties';
    });

    builder.addCase(deletePropertyByAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deletePropertyByAdmin.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.properties = state.properties.filter((p) => p.id !== action.payload);
        state.propertiesTotal = Math.max(0, state.propertiesTotal - 1);
        state.propertiesTotalPages = Math.ceil(state.propertiesTotal / state.propertiesLimit);
        if (state.propertiesPage > state.propertiesTotalPages && state.propertiesTotalPages > 0) {
          state.propertiesPage = 1;
        }
      }
    );
    builder.addCase(deletePropertyByAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to delete property';
    });

    builder.addCase(fetchBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchBookings.fulfilled,
      (state, action: PayloadAction<{ data: Booking[]; meta: BookingsPaginationMeta }>) => {
        state.loading = false;
        state.bookings = action.payload.data;
        state.bookingsPage = action.payload.meta.page;
        state.bookingsLimit = action.payload.meta.limit;
        state.bookingsTotal = action.payload.meta.totalBookings;
        state.bookingsTotalPages = action.payload.meta.totalPages;
      }
    );
    builder.addCase(fetchBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load bookings';
    });

    builder.addCase(updateBookingStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateBookingStatus.fulfilled, (state, action: PayloadAction<Booking>) => {
      state.loading = false;
      const idx = state.bookings.findIndex((b) => b.id === action.payload.id);
      if (idx >= 0) state.bookings[idx] = action.payload;
    });
    builder.addCase(updateBookingStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to update booking status';
    });

    builder.addCase(fetchReviews.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchReviews.fulfilled,
      (state, action: PayloadAction<{ data: Review[]; meta: ReviewsPaginationMeta }>) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.reviewsPage = action.payload.meta.page;
        state.reviewsLimit = action.payload.meta.limit;
        state.reviewsTotal = action.payload.meta.totalReviews;
        state.reviewsTotalPages = action.payload.meta.totalPages;
      }
    );
    builder.addCase(fetchReviews.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load reviews';
    });

    builder.addCase(deleteReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteReview.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.reviews = state.reviews.filter((r) => r.id !== action.payload);
      state.reviewsTotal = Math.max(0, state.reviewsTotal - 1);
      state.reviewsTotalPages = Math.ceil(state.reviewsTotal / state.reviewsLimit);
      if (state.reviewsPage > state.reviewsTotalPages && state.reviewsTotalPages > 0) {
        state.reviewsPage = 1;
      }
    });
    builder.addCase(deleteReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to delete review';
    });

    builder.addCase(fetchMetrics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMetrics.fulfilled, (state, action: PayloadAction<Metrics>) => {
      state.loading = false;
      state.metrics = action.payload;
    });
    builder.addCase(fetchMetrics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load metrics';
    });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
