// src/redux/slices/signupSlice.ts
// 회원가입 정보를 관리하는 SignupState Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SignupState {
  studentID: string;
  password: string;
  name: string;
  collegeName: string;
  departmentName: string;
  telNum: string;
}

const initialState: SignupState = {
  studentID: '',
  password: '',
  name: '',
  collegeName: '',
  departmentName: '',
  telNum: '',
};

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setStudentID: (state, action: PayloadAction<string>) => {
      state.studentID = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setCollegeName: (state, action: PayloadAction<string>) => {
      state.collegeName = action.payload;
    },
    setDepartmentName: (state, action: PayloadAction<string>) => {
      state.departmentName = action.payload;
    },
    setTelNum: (state, action: PayloadAction<string>) => {
      state.telNum = action.payload;
    },
  },
});

export const {
  setStudentID,
  setPassword,
  setName,
  setCollegeName,
  setDepartmentName,
  setTelNum,
} = signupSlice.actions;

export default signupSlice.reducer;
