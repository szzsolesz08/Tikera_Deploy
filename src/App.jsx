import './App.css'
import Home from './Home';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Home />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
