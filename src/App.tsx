import { Fragment } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { DashboardContainer } from './pages/dashboardContainer';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import './App.css';

const BASE_PATH = process.env.PUBLIC_URL;

function App() {
  return (
    <Fragment>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <BrowserRouter basename={BASE_PATH}>
          <Routes>
            <Route path='/' element={<DashboardContainer />}></Route>
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </Fragment>
  );
}

export default App;
