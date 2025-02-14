/**
 * App component that sets up the routing for the application using react-router-dom.
 *
 * The component uses BrowserRouter to enable client-side routing.
 *
 * Routes:
 * - "/" renders the Homepage component.
 * - "/tasks/:id" renders the TaskForm component for editing a task with a specific ID.
 * - "/tasks/new" renders the TaskForm component for creating a new task.
 *
 * @component
 */
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Homepage from './pages/HomePage';
import TaskForm from './pages/TaskForm';


function App (){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/tasks/:id" element={<TaskForm />} />
        <Route path="/tasks/new" element={<TaskForm />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App;