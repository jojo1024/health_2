import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialUser } from '../contexts/AuthContext';
import { UserInfo } from '../types';

export interface AuthState {
    userInfo: UserInfo;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    userInfo: initialUser,
    isAuthenticated: false,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUserInfo: (state, action: PayloadAction<any>) => {
            state.userInfo = action.payload;
            state.isAuthenticated = true;
        },
        clearUserInfo: (state) => {
            state.userInfo = initialUser;
            state.isAuthenticated = false;
        },
    },
})

export const { setUserInfo, clearUserInfo } = authSlice.actions;
export default authSlice.reducer;