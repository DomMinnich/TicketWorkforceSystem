
import React, { useState, useEffect, useCallback } from 'react';
import { Task, LogEntry, TaskCategory } from '../types';
import * as taskManagerService from '../services/taskManagerService';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { TextArea } from '../components/common/TextArea';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { PlusIcon, CheckCircleIcon, ArrowPathIcon, TrashIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { TASK_CATEGORIES } from '../constants';
import { formatDateTime } from '../utils/helpers';

const TaskItem: React.FC<{ task: Task; onAction: () => void; category: TaskCategory }> = ({ task, onAction, category }) => {
  const { addNotification } = useNotifications();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleComplete = async () => {
    setIsActionLoading(true);
    try {
      await taskManagerService.completeTask(task.id, category);
      addNotification('Task completed!', 'success');
      onAction();
    } catch (e:any) { addNotification(e.message || 'Failed to complete task', 'error'); }
    finally { setIsActionLoading(false); }
  };
  const handleReset = async () => {
    setIsActionLoading(true);
    try {
      await taskManagerService.resetTask(task.id, category);
      addNotification('Task reset!', 'success');
      onAction();
    } catch (e:any) { addNotification(e.message || 'Failed to reset task', 'error'); }
    finally { setIsActionLoading(false); }
  };
  const handleDelete = async () => {
     if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
        setIsActionLoading(true);
        try {
        await taskManagerService.deleteTask(task.id, category);
        addNotification('Task deleted!', 'success');
        onAction();
        } catch (e:any) { addNotification(e.message || 'Failed to delete task', 'error'); }
        finally { setIsActionLoading(false); }
    }
  };

  return (
    <li className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow flex justify-between items-center">
      <div>
        <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>{task.title}</h4>
        {task.description && <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>}
        <p className="text-xs text-gray-400 dark:text-gray-500">
            Created: {formatDateTime(task.created_at)} by {task.created_by_email || 'System'}
            {task.completed_at && `, Completed: ${formatDateTime(task.completed_at)}`}
            {task.last_completed_at && !task.completed && `, Last Completed: ${formatDateTime(task.last_completed_at)}`}
        </p>
      </div>
      <div className="flex space-x-2">
        {!task.completed && <Button size="sm" variant="primary" onClick={handleComplete} icon={<CheckCircleIcon className="h-4 w-4"/>} isLoading={isActionLoading} title="Complete"/>}
        {task.completed && <Button size="sm" variant="secondary" onClick={handleReset} icon={<ArrowPathIcon className="h-4 w-4"/>} isLoading={isActionLoading} title="Reset"/>}
        <Button size="sm" variant="danger" onClick={handleDelete} icon={<TrashIcon className="h-4 w-4"/>} isLoading={isActionLoading} title="Delete"/>
      </div>
    </li>
  );
};

const LogItemDisplay: React.FC<{ log: LogEntry }> = ({ log }) => (
  <li className="p-2 border-b border-gray-200 dark:border-gray-700">
    <p className="text-sm text-gray-700 dark:text-gray-300">{log.message}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(log.timestamp)} by {log.user_email || 'System'}</p>
  </li>
);

const TaskManagerPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>(TaskCategory.Tech);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const categoryOptions = TASK_CATEGORIES.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }));

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const data = await taskManagerService.getTasksByCategory(selectedCategory);
      setTasks(data);
    } catch (e:any) { addNotification(e.message || 'Failed to fetch tasks', 'error'); }
    finally { setLoadingTasks(false); }
  }, [selectedCategory, addNotification]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const data = await taskManagerService.getLogsByCategory(selectedCategory);
      setLogs(data);
    } catch (e:any) { addNotification(e.message || 'Failed to fetch logs', 'error'); }
    finally { setLoadingLogs(false); }
  }, [selectedCategory, addNotification]);

  useEffect(() => {
    fetchTasks();
    fetchLogs();
  }, [selectedCategory, fetchTasks, fetchLogs]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      addNotification('Task title is required.', 'error');
      return;
    }
    setIsSubmittingTask(true);
    try {
      await taskManagerService.addTask({ title: newTaskTitle, description: newTaskDescription, category: selectedCategory });
      addNotification('Task added successfully!', 'success');
      setIsAddTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      fetchTasks(); // Refresh tasks list
      fetchLogs(); // Refresh logs
    } catch (e:any) { addNotification(e.message || 'Failed to add task', 'error'); }
    finally { setIsSubmittingTask(false); }
  };

  const handleClearLogs = async () => {
    if (window.confirm(`Are you sure you want to clear all logs for the ${selectedCategory} category? A backup will be attempted first.`)) {
        try {
            await taskManagerService.clearLogsByCategory(selectedCategory);
            addNotification(`Logs for ${selectedCategory} cleared.`, 'success');
            fetchLogs(); // Refresh logs
        } catch (e:any) {
            addNotification(e.message || 'Failed to clear logs.', 'error');
        }
    }
  };

  const handleDownloadLogs = () => {
      const url = taskManagerService.getDownloadLogsUrl(selectedCategory);
      window.open(url, '_blank'); // Opens in new tab, browser handles download
      addNotification(`Attempting to download logs for ${selectedCategory}...`, 'info');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Task Manager</h1>
      
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Select
                label="Select Category"
                options={categoryOptions}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TaskCategory)}
                className="w-full sm:w-auto"
            />
            <Button onClick={() => setIsAddTaskModalOpen(true)} icon={<PlusIcon className="h-5 w-5"/>} className="w-full sm:w-auto">
                Add New Task
            </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Tasks`}>
          {loadingTasks ? <LoadingSpinner/> : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.length > 0 ? tasks.map(task => <TaskItem key={task.id} task={task} onAction={fetchTasks} category={selectedCategory}/>)
                                : <p className="text-gray-500 dark:text-gray-400">No tasks in this category.</p>}
            </ul>
          )}
        </Card>
        
        <Card title={`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Logs`}>
            <div className="flex justify-end space-x-2 mb-3">
                <Button size="sm" variant="ghost" onClick={handleDownloadLogs} icon={<ArrowDownTrayIcon className="h-4 w-4"/>}>Download Logs</Button>
                <Button size="sm" variant="danger" onClick={handleClearLogs} icon={<TrashIcon className="h-4 w-4"/>}>Clear Logs</Button>
            </div>
          {loadingLogs ? <LoadingSpinner/> : (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length > 0 ? logs.map(log => <LogItemDisplay key={log.id} log={log}/>)
                                : <p className="text-gray-500 dark:text-gray-400">No logs in this category.</p>}
            </ul>
          )}
        </Card>
      </div>

      <Modal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} title={`Add New ${selectedCategory} Task`}>
        <div className="space-y-4">
            <Input label="Task Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required/>
            <TextArea label="Description (Optional)" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} rows={3}/>
            <div className="flex justify-end space-x-2 pt-2">
                <Button variant="ghost" onClick={() => setIsAddTaskModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTask} isLoading={isSubmittingTask}>Add Task</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskManagerPage;
