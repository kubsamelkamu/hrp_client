import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';
import axios from 'axios';
import { changeUserRole } from './adminSlice';

export const registerUser = createAsyncThunk<
  void,
  { name: string; email: string; password: string },
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/register', userData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk<
  {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'TENANT' | 'LANDLORD' | 'ADMIN';
      profilePhoto?: string;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  },
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentProfile = createAsyncThunk<
  {
    id: string;
    name: string;
    email: string;
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    profilePhoto: string | null;
    createdAt: string;
    updatedAt: string;
  },
  void,
  { rejectValue: string }
>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch profile');
    }
  }
);

export const saveProfile = createAsyncThunk<
  {
    id: string;
    name: string;
    email: string;
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    profilePhoto: string | null;
    createdAt: string;
    updatedAt: string;
  },
  FormData,
  { rejectValue: string }
>(
  'auth/saveProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to save profile');
    }
  }
);

interface AuthState {
  user:
    | {
        id: string;
        name: string;
        email: string;
        role: 'TENANT' | 'LANDLORD' | 'ADMIN';
        profilePhoto?: string | null;
        createdAt: string;
        updatedAt: string;
      }
    | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      state.loading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuth: (
      state,
      action: PayloadAction<{
        user: {
          id: string;
          name: string;
          email: string;
          role: 'TENANT' | 'LANDLORD' | 'ADMIN';
          profilePhoto?: string | null;
          createdAt: string;
          updatedAt: string;
        };
        token: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'succeeded';
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.status = 'succeeded';
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to register';
    });

    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.loading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.loading = false;
      state.error =
        action.payload || action.error.message || 'Failed to login';
    });

    builder.addCase(fetchCurrentProfile.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      fetchCurrentProfile.fulfilled,
      (state, { payload }) => {
        state.status = 'succeeded';
        state.user = payload;
        localStorage.setItem('user', JSON.stringify(payload));
      }
    );
    builder.addCase(fetchCurrentProfile.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to load profile';
    });

    builder.addCase(saveProfile.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(saveProfile.fulfilled, (state, { payload }) => {
      state.status = 'succeeded';
      state.user = payload;
      localStorage.setItem('user', JSON.stringify(payload));
    });
    builder.addCase(saveProfile.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to save profile';
    });

    builder.addCase(changeUserRole.fulfilled, (state) => {
      state.status = 'succeeded';
      state.error = null;
    });
    builder.addCase(changeUserRole.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to update role';
    });
  },
});

export const { logout, clearError, setAuth } = authSlice.actions;
export default authSlice.reducer;
