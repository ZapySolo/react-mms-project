import React, {useState} from 'react';
import Login from './screens/Login';
import Home from './screens/Home';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  
  return isLogged?<Home/>: <Login onLogin={setIsLogged} />;
}

export default App;
