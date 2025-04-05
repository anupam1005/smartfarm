import './App.css';
import Dashboard from './components/Dashboard';
import SensorData from './components/SensorData.tsx'; // Ensure the file exists at this path
import Navigation from './components/Navigation.tsx';
import WeatherInfo from './components/WeatherInfo';
import AddEntry from './components/AddEntry.tsx'; // if extension is needed


const dummyWeatherData = {
  temperature: 25,
  humidity: 60,
  windSpeed: 10,
  description: "Clear sky"
};

function App() {
  return (
    <div className="App">
      <Navigation />
      <Dashboard />
      <SensorData />
      <WeatherInfo data={dummyWeatherData} />
      <AddEntry />
    </div>
  );
}

export default App;
