import React, { useContext } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ThemeModeProvider, ThemeContext } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';
import { createAppTheme } from './theme';

const ThemedApp: React.FC = () => {
  const themeContext = useContext(ThemeContext);
  const mode = themeContext?.mode || 'light';
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;
