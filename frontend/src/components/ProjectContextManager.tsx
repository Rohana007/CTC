import React, { useState, useEffect } from 'react';
import { ProjectContext } from '../../../shared/types';
import { Plus, Edit2, Trash2, Save, X, Folder, Database, Globe, Zap } from 'lucide-react';
import { apiClient } from '../services/api';

export const ProjectContextManager: React.FC = () => {
  const [contexts, setContexts] = useState<ProjectContext[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectContext>>({
    name: '',
    type: 'web_app',
    domain: 'other',
    techStack: { frontend: [], backend: [], database: [], other: [] },
    dataCharacteristics: {
      type: 'user_input',
      volume: 'medium',
      velocity: 'moderate'
    },
    description: ''
  });

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    try {
      const data = await apiClient.get('/api/project-context/list');
      setContexts(data.contexts || []);
    } catch (error) {
      console.error('Error loading contexts:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const data = await apiClient.post('/api/project-context/create', formData);
      setContexts([...contexts, data.projectContext]);
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error('Error creating context:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const data = await apiClient.put(`/api/project-context/${id}`, formData);
      setContexts(contexts.map(ctx => ctx.id === id ? data.projectContext : ctx));
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Error updating context:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project context?')) return;
    
    try {
      await apiClient.delete(`/api/project-context/${id}`);
      setContexts(contexts.filter(ctx => ctx.id !== id));
    } catch (error) {
      console.error('Error deleting context:', error);
    }
  };

  const startEdit = (context: ProjectContext) => {
    setEditingId(context.id);
    setFormData(context);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'web_app',
      domain: 'other',
      techStack: { frontend: [], backend: [], database: [], other: [] },
      dataCharacteristics: {
        type: 'user_input',
        volume: 'medium',
        velocity: 'moderate'
      },
      description: ''
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web_app': return <Globe className="w-4 h-4" />;
      case 'mobile_app': return <Zap className="w-4 h-4" />;
      case 'iot': return <Database className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Contexts</h2>
          <p className="text-gray-600 mt-1">Manage your project contexts for context-aware code analysis</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Context
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isCreating ? 'Create New Project Context' : 'Edit Project Context'}
          </h3>
          
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., DelhiBreathes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Project Type & Domain */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="web_app">Web App</option>
                  <option value="mobile_app">Mobile App</option>
                  <option value="iot">IoT</option>
                  <option value="data_science">Data Science</option>
                  <option value="ml">Machine Learning</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain *
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="healthcare">Healthcare</option>
                  <option value="environment">Environment</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your project..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contexts.map((context) => (
          <div
            key={context.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  {getTypeIcon(context.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{context.name}</h3>
                  <p className="text-xs text-gray-500">{context.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(context)}
                  className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(context.id)}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">Domain:</span>
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {context.domain}
                </span>
              </div>
              {context.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{context.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {contexts.length === 0 && !isCreating && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No project contexts yet</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Your First Context
          </button>
        </div>
      )}
    </div>
  );
};
