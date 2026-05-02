import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import GalleryPage from './components/GalleryPage';
import BuilderPage from './components/BuilderPage';

function App() {
   return (
      <Router>
         <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/builder" element={<BuilderPage />} />
         </Routes>
      </Router>
   );
}

export default App;
