import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([])
    const [selectedTask, setSelectedTask] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: ''
    })
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'Low'
    })

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/usersTasks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const data = await response.json()
            if (response.ok) {
                setTasks(data)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to fetch tasks')
        }
    }

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filters.status === 'all' || task.status === filters.status
        const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
        const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                            task.description.toLowerCase().includes(filters.search.toLowerCase())
        return matchesStatus && matchesPriority && matchesSearch
    })

    const handleDelete = async (task) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks/${task._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const data = await response.json()
            if (response.ok) {
                setTasks(tasks.filter(t => t._id !== task._id))
            } else {
                setError(data.message)
            }
        }catch(err){
            setError('Failed to delete task')
        }finally{
            setIsLoading(false)
        }
    }

    const handleStatusChange = async (task) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks/${task._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: task.status === 'complete' ? 'incomplete' : 'complete'
                })
            })
            const data = await response.json()
            if (response.ok) {
                setTasks(tasks.map(t => t._id === task._id ? { ...t, status: data.status } : t))
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to update task status')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddTask = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newTask)
            })
            const data = await response.json()
            if (response.ok) {
                setTasks([...tasks, data])
                setShowAddModal(false)
                setNewTask({ title: '', description: '', priority: 'Low' })
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to add task')
        } finally {
            setIsLoading(false)
        }
    }
    
    useEffect(() => {
        if(error === "Invalid token"){
            localStorage.removeItem('token')
            navigate("/login")
        }
    }, [error])

    useEffect(() => {
        fetchTasks()
    }, [])

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-50">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Add Task
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-6 space-y-4">
                <div className="flex text-gray-700 gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="px-4 text-gray-700 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="complete">Complete</option>
                        <option value="incomplete">Incomplete</option>
                    </select>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({...filters, priority: e.target.value})}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Tasks</h2>
                <div className="grid gap-4">
                    {filteredTasks.map((task) => (
                        <div 
                            key={task.id} 
                            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
                            onClick={() => setSelectedTask(task)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleStatusChange(task)
                                        }}
                                        disabled={isLoading}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
                                            task.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {task.status}
                                    </button>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {task.priority}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(task)
                                        }}
                                        disabled={isLoading}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} text-red-500`}
                                    >
                                       Delete 
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-800">{task.description}</p>
                            <div className="mt-4 text-sm text-gray-600">
                                Created: {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Description</h3>
                                <p className="text-gray-600">{selectedTask.description}</p>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Status</h3>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        selectedTask.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {selectedTask.status}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Priority</h3>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        selectedTask.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        selectedTask.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedTask.priority}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Created</h3>
                                <p className="text-gray-600">
                                    {new Date(selectedTask.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-black">Add New Task</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black">Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isLoading ? 'Adding...' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}