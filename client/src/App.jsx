/**
 * App component that sets up the routing for the application.
 *
 * This component uses `react-router-dom` to define routes for the application.
 *
 * Routes:
 * - `/` renders the `Homepage` component.
 * - `/tasks/new` renders the `TaskForm` component.
 *
 * @component
 * @example
 * return (
 *   <App />
 * )
 */
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Homepage from './pages/HomePage';
import TaskForm from './pages/TaskForm';


function App (){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/tasks/new" element={<TaskForm />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App;