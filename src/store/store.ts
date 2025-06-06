import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './slices/adminSlice';
import authReducer from '@/store/slices/authSlice';
import propertyReducer from '@/store/slices/propertySlice';
import bookingReducer from '@/store/slices/bookingSlice';  
import paymentReducer from '@/store/slices/paymentSlice';
import reviewReducer from './slices/reviewSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    properties: propertyReducer,
    bookings: bookingReducer,  
    payment: paymentReducer,
    reviews: reviewReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
