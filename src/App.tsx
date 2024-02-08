import './App.css';
import './style.css';
import logo from './assets/logo.svg';
import tinybase from './assets/tinybase.svg';
import { Example } from './Example';

export default function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <div className='App-logos'>
          <img src={logo} className='App-logo' alt='logo' />
          <img src={tinybase} className='App-logo tinybase' alt='tinybase' />
        </div>
        <Example />
      </header>
    </div>
  );
}
