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
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/HomePage';
import TaskForm from './pages/TaskForm';
import Navbar from './components/Navbar'

function App() {
  return (

    <BrowserRouter>
      <div className="container mx-auto px-10">
        <Navbar />

        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/tasks/new" element={<TaskForm mode="create" />} />
          <Route path="/tasks/:id" element={<TaskForm mode="view" />} />
          <Route path="/tasks/:id/edit" element={<TaskForm mode="edit" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;