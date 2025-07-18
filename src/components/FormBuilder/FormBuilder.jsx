import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Eye, Settings, Link, Image as ImageIcon, Type, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';

const FormBuilder = ({ formSchema = [], onChange }) => {
  const [fields, setFields] = useState(formSchema);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedField, setDraggedField] = useState(null);

  // Update fields when formSchema prop changes
  useEffect(() => {
    setFields(formSchema);
  }, [formSchema]);

  const fieldTypes = [
    { type: 'text', label: 'Short Text', icon: '📝', category: 'input' },
    { type: 'textarea', label: 'Long Text', icon: '📄', category: 'input' },
    { type: 'email', label: 'Email', icon: '📧', category: 'input' },
    { type: 'phone', label: 'Phone Number', icon: '📞', category: 'input' },
    { type: 'number', label: 'Number', icon: '🔢', category: 'input' },
    { type: 'select', label: 'Dropdown', icon: '📋', category: 'choice' },
    { type: 'radio', label: 'Multiple Choice', icon: '⚪', category: 'choice' },
    { type: 'checkbox', label: 'Checkboxes', icon: '☑️', category: 'choice' },
    { type: 'file', label: 'File Upload', icon: '📎', category: 'input' },
    { type: 'date', label: 'Date', icon: '📅', category: 'input' },
    { type: 'time', label: 'Time', icon: '⏰', category: 'input' },
    { type: 'url', label: 'Website URL', icon: '🌐', category: 'input' },
    { type: 'label', label: 'Description', icon: '📋', category: 'content' },
    { type: 'image', label: 'Image', icon: '🖼️', category: 'content' },
    { type: 'link', label: 'Link/Button', icon: '🔗', category: 'content' }
  ];

  const addField = (type) => {
    console.log('addField called with type:', type);
    const fieldType = fieldTypes.find(f => f.type === type);
    console.log('Found field type:', fieldType);
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: fieldType?.category === 'content' ? '' : `${fieldType?.label || 'New Field'}`,
      required: false,
      placeholder: '',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : undefined,
      validation: {},
      helpText: '',
      acceptedFileTypes: type === 'file' ? '*' : undefined,
      // Content field properties
      content: type === 'label' ? 'Add your description here. You can use [links](https://example.com) in your text.' : '',
      imageUrl: type === 'image' ? 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400' : undefined,
      altText: type === 'image' ? 'Sample image' : undefined,
      linkUrl: type === 'link' ? 'https://example.com' : undefined,
      linkText: type === 'link' ? 'Click here' : undefined,
      openInNewTab: type === 'link' ? true : undefined,
      buttonStyle: type === 'link' ? 'primary' : undefined,
      fontSize: type === 'label' ? 'medium' : undefined,
      alignment: (type === 'label' || type === 'image') ? 'left' : undefined
    };
    
    const updatedFields = [...fields, newField];
    console.log('Updated fields:', updatedFields);
    setFields(updatedFields);
    onChange(updatedFields);
    console.log('Closing modal after adding field');
    setShowAddField(false);
    
    // Auto-open settings for content fields
    if (['label', 'image', 'link'].includes(type)) {
      console.log('Auto-opening settings for content field');
      setTimeout(() => setEditingField(newField), 100);
    }
  };

  const updateField = (fieldId, updates) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const deleteField = (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      const updatedFields = fields.filter(field => field.id !== fieldId);
      setFields(updatedFields);
      onChange(updatedFields);
    }
  };

  const duplicateField = (field) => {
    const newField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: field.label + ' (Copy)'
    };
    const fieldIndex = fields.findIndex(f => f.id === field.id);
    const updatedFields = [...fields];
    updatedFields.splice(fieldIndex + 1, 0, newField);
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const moveField = (fieldId, direction) => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(currentIndex, 1);
    updatedFields.splice(newIndex, 0, movedField);
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const FieldEditor = ({ field, index }) => {
    const fieldType = fieldTypes.find(f => f.type === field.type);
    
    const addOption = () => {
      const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
      updateField(field.id, { options: newOptions });
    };

    const updateOption = (optionIndex, value) => {
      const newOptions = [...(field.options || [])];
      newOptions[optionIndex] = value;
      updateField(field.id, { options: newOptions });
    };

    const removeOption = (optionIndex) => {
      const newOptions = field.options?.filter((_, i) => i !== optionIndex) || [];
      updateField(field.id, { options: newOptions });
    };

    const renderFieldPreview = () => {
      switch (field.type) {
        case 'label':
          return (
            <div className={`${getAlignmentClass(field.alignment)} mb-4`}>
              <div 
                className={`${getFontSizeClass(field.fontSize)} text-gray-900 dark:text-white`}
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdownLinks(field.content || 'Add your description here...') 
                }}
              />
            </div>
          );

        case 'image':
          return (
            <div className={`${getAlignmentClass(field.alignment)} mb-4`}>
              {field.imageUrl ? (
                <img 
                  src={field.imageUrl} 
                  alt={field.altText || 'Form image'} 
                  className="max-w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    e.target.src = 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          );

        case 'link':
          const buttonClasses = {
            primary: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg inline-block',
            secondary: 'bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-lg inline-block',
            outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg inline-block',
            link: 'text-blue-600 dark:text-blue-400 hover:underline inline-block'
          };

          return (
            <div className="mb-4">
              <span className={`transition-colors cursor-pointer ${buttonClasses[field.buttonStyle || 'primary']}`}>
                {field.linkText || 'Click here'}
              </span>
            </div>
          );

        case 'select':
          return (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option>Select an option</option>
                {field.options?.map((option, i) => (
                  <option key={i}>{option}</option>
                ))}
              </select>
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <div className="space-y-2">
                {field.options?.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input type="radio" disabled className="text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'checkbox':
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <div className="space-y-2">
                {field.options?.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input type="checkbox" disabled className="rounded border-gray-300 dark:border-gray-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'textarea':
          return (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <textarea
                disabled
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          );

        case 'file':
          return (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <input
                type="file"
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {field.helpText && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );

        default:
          return (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <input
                type={field.type}
                disabled
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          );
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
      >
        {/* Field Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{fieldType?.icon}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {fieldType?.label}
              </span>
            </div>
            {field.required && (
              <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded">
                Required
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, 'up')}
              disabled={index === 0}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, 'down')}
              disabled={index === fields.length - 1}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => duplicateField(field)}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingField(field)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => deleteField(field.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Field Preview */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          {renderFieldPreview()}
        </div>

        {/* Quick Edit for Choice Fields */}
        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {field.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(optionIndex, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optionIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const FormPreview = ({ fields }) => {
    const [formData, setFormData] = useState({});

    const renderField = (field) => {
      // Handle content fields
      if (field.type === 'label') {
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-6`}>
            <div 
              className={`${getFontSizeClass(field.fontSize)} text-gray-900 dark:text-white`}
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdownLinks(field.content || '') 
              }}
            />
          </div>
        );
      }

      if (field.type === 'image') {
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-6`}>
            {field.imageUrl && (
              <img 
                src={field.imageUrl} 
                alt={field.altText || 'Form image'} 
                className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                onError={(e) => {
                  e.target.src = 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
            )}
          </div>
        );
      }

      if (field.type === 'link') {
        const buttonClasses = {
          primary: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg',
          secondary: 'bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-lg',
          outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg',
          link: 'text-blue-600 dark:text-blue-400 hover:underline'
        };

        return (
          <div key={field.id} className="mb-6">
            <a
              href={field.linkUrl || '#'}
              target={field.openInNewTab ? '_blank' : '_self'}
              rel={field.openInNewTab ? 'noopener noreferrer' : ''}
              className={`inline-block transition-colors ${buttonClasses[field.buttonStyle || 'primary']}`}
            >
              {field.linkText || 'Click here'}
            </a>
          </div>
        );
      }

      // Handle regular form fields
      const commonProps = {
        key: field.id,
        label: field.label + (field.required ? ' *' : ''),
        value: formData[field.id] || '',
        onChange: (e) => setFormData({ ...formData, [field.id]: e.target.value }),
        placeholder: field.placeholder,
        required: field.required
      };

      switch (field.type) {
        case 'textarea':
          return (
            <div key={field.id} className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <textarea
                value={formData[field.id] || ''}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {field.helpText && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );

        case 'select':
          return (
            <div key={field.id} className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <select
                value={formData[field.id] || ''}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                {field.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {field.helpText && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );

        case 'radio':
          return (
            <div key={field.id} className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`${field.id}-${index}`}
                      name={field.id}
                      value={option}
                      checked={formData[field.id] === option}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      required={field.required}
                      className="text-blue-600"
                    />
                    <label htmlFor={`${field.id}-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              {field.helpText && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );

        case 'checkbox':
          return (
            <div key={field.id} className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`${field.id}-${index}`}
                      value={option}
                      checked={(formData[field.id] || []).includes(option)}
                      onChange={(e) => {
                        const currentValues = formData[field.id] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter(v => v !== option);
                        setFormData({ ...formData, [field.id]: newValues });
                      }}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor={`${field.id}-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              {field.helpText && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );

        case 'file':
          return (
            <div key={field.id} className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <input
                type="file"
                required={field.required}
                accept={field.acceptedFileTypes || '*'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {field.helpText && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );

        default:
          return (
            <div key={field.id} className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <input
                type={field.type}
                value={formData[field.id] || ''}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {field.helpText && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Registration Form Preview
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              This is how your form will appear to users
            </p>
          </div>
          
          <form className="space-y-6">
            {fields.map(renderField)}
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="submit" className="w-full" disabled>
                Submit Registration (Preview Mode)
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Helper functions
  const renderMarkdownLinks = (text) => {
    if (!text) return text;
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">${linkText}</a>`;
    });
  };

  const getFontSizeClass = (size) => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getAlignmentClass = (alignment) => {
    switch (alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Registration Form Builder
        </h3>
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            type="button"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Form' : 'Preview Form'}
          </Button>
          {!previewMode && (
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add Field clicked, current state:', showAddField);
                setShowAddField(true);
                console.log('Add Field state set to true');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          )}
        </div>
      </div>

      {previewMode ? (
        <FormPreview fields={fields} />
      ) : (
        <div className="space-y-4">
          {/* Debug info - remove after testing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
              Debug: showAddField = {showAddField.toString()}, fields count = {fields.length}
            </div>
          )}
          
          <AnimatePresence>
            {fields.map((field, index) => (
              <FieldEditor
                key={field.id}
                field={field}
                index={index}
              />
            ))}
          </AnimatePresence>

          {fields.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="max-w-sm mx-auto">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No form fields yet
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start building your registration form by adding your first field
                </p>
                <Button onClick={() => setShowAddField(true)} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Field
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Field Modal */}
      <Modal
        isOpen={showAddField}
        onClose={() => {
          console.log('Closing Add Field modal');
          setShowAddField(false);
        }}
        title="Add Form Field"
        size="xl"
      >
        <div className="space-y-8">
          {/* Input Fields */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">📝</span>
              Input Fields
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {fieldTypes.filter(f => f.category === 'input').map((fieldType) => (
                <motion.button
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Adding field type:', fieldType.type);
                    addField(fieldType.type);
                  }}
                  className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{fieldType.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {fieldType.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Choice Fields */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">☑️</span>
              Choice Fields
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fieldTypes.filter(f => f.category === 'choice').map((fieldType) => (
                <motion.button
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Adding choice field type:', fieldType.type);
                    addField(fieldType.type);
                  }}
                  className="p-4 border-2 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-center group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{fieldType.icon}</div>
                  <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {fieldType.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Elements */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">🎨</span>
              Content Elements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fieldTypes.filter(f => f.category === 'content').map((fieldType) => (
                <motion.button
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Adding content field type:', fieldType.type);
                    addField(fieldType.type);
                  }}
                  className="p-4 border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-xl hover:border-green-300 dark:hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all text-center group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{fieldType.icon}</div>
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    {fieldType.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Field Settings Modal */}
      <Modal
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        title={`Edit ${fieldTypes.find(f => f.type === editingField?.type)?.label || 'Field'}`}
        size="lg"
      >
        {editingField && (
          <div className="space-y-6">
            {/* Content Fields Settings */}
            {editingField.type === 'label' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content/Description
                  </label>
                  <textarea
                    value={editingField.content || ''}
                    onChange={(e) => {
                      const updated = { ...editingField, content: e.target.value };
                      setEditingField(updated);
                      updateField(editingField.id, { content: e.target.value });
                    }}
                    placeholder="Enter description, instructions, or any text content..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can include links using markdown: [Link Text](https://example.com)
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Size
                    </label>
                    <select
                      value={editingField.fontSize || 'medium'}
                      onChange={(e) => {
                        const updated = { ...editingField, fontSize: e.target.value };
                        setEditingField(updated);
                        updateField(editingField.id, { fontSize: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alignment
                    </label>
                    <select
                      value={editingField.alignment || 'left'}
                      onChange={(e) => {
                        const updated = { ...editingField, alignment: e.target.value };
                        setEditingField(updated);
                        updateField(editingField.id, { alignment: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {editingField.type === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image Source
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="imageUrl"
                        name="imageSource"
                        value="url"
                        checked={!editingField.useFileUpload}
                        onChange={() => {
                          const updated = { ...editingField, useFileUpload: false };
                          setEditingField(updated);
                          updateField(editingField.id, { useFileUpload: false });
                        }}
                        className="text-blue-600"
                      />
                      <label htmlFor="imageUrl" className="text-sm text-gray-700 dark:text-gray-300">
                        Use Image URL/Link
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="imageUpload"
                        name="imageSource"
                        value="upload"
                        checked={editingField.useFileUpload}
                        onChange={() => {
                          const updated = { ...editingField, useFileUpload: true };
                          setEditingField(updated);
                          updateField(editingField.id, { useFileUpload: true });
                        }}
                        className="text-blue-600"
                      />
                      <label htmlFor="imageUpload" className="text-sm text-gray-700 dark:text-gray-300">
                        Upload Image File
                      </label>
                    </div>
                  </div>
                </div>

                {!editingField.useFileUpload ? (
                  <Input
                    label="Image URL"
                    value={editingField.imageUrl || ''}
                    onChange={(e) => {
                      const updated = { ...editingField, imageUrl: e.target.value };
                      setEditingField(updated);
                      updateField(editingField.id, { imageUrl: e.target.value });
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            // Import Firebase storage functions
                            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                            const { storage } = await import('../../firebase');
                            
                            // Upload file to Firebase Storage
                            const imageRef = ref(storage, `form-images/${Date.now()}_${file.name}`);
                            await uploadBytes(imageRef, file);
                            const imageUrl = await getDownloadURL(imageRef);
                            
                            // Update field with uploaded image URL
                            const updated = { ...editingField, imageUrl };
                            setEditingField(updated);
                            updateField(editingField.id, { imageUrl });
                          } catch (error) {
                            console.error('Error uploading image:', error);
                            alert('Failed to upload image. Please try again.');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                    </p>
                  </div>
                )}
                
                <Input
                  label="Alt Text (Optional)"
                  value={editingField.altText || ''}
                  onChange={(e) => {
                    const updated = { ...editingField, altText: e.target.value };
                    setEditingField(updated);
                    updateField(editingField.id, { altText: e.target.value });
                  }}
                  placeholder="Description of the image"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alignment
                  </label>
                  <select
                    value={editingField.alignment || 'center'}
                    onChange={(e) => {
                      const updated = { ...editingField, alignment: e.target.value };
                      setEditingField(updated);
                      updateField(editingField.id, { alignment: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                
                {editingField.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                    <img 
                      src={editingField.imageUrl} 
                      alt={editingField.altText || 'Preview'} 
                      className="max-w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        e.target.src = 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {editingField.type === 'link' && (
              <div className="space-y-4">
                <Input
                  label="Link URL"
                  value={editingField.linkUrl || ''}
                  onChange={(e) => {
                    const updated = { ...editingField, linkUrl: e.target.value };
                    setEditingField(updated);
                    updateField(editingField.id, { linkUrl: e.target.value });
                  }}
                  placeholder="https://example.com"
                />
                
                <Input
                  label="Link Text"
                  value={editingField.linkText || ''}
                  onChange={(e) => {
                    const updated = { ...editingField, linkText: e.target.value };
                    setEditingField(updated);
                    updateField(editingField.id, { linkText: e.target.value });
                  }}
                  placeholder="Click here"
                />
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`newTab-${editingField.id}`}
                    checked={editingField.openInNewTab || false}
                    onChange={(e) => {
                      const updated = { ...editingField, openInNewTab: e.target.checked };
                      setEditingField(updated);
                      updateField(editingField.id, { openInNewTab: e.target.checked });
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor={`newTab-${editingField.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                    Open in new tab
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Button Style
                  </label>
                  <select
                    value={editingField.buttonStyle || 'primary'}
                    onChange={(e) => {
                      const updated = { ...editingField, buttonStyle: e.target.value };
                      setEditingField(updated);
                      updateField(editingField.id, { buttonStyle: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="primary">Primary Button</option>
                    <option value="secondary">Secondary Button</option>
                    <option value="outline">Outline Button</option>
                    <option value="link">Text Link</option>
                  </select>
                </div>
              </div>
            )}

            {/* Regular Field Settings */}
            {!['label', 'image', 'link'].includes(editingField.type) && (
              <div className="space-y-4">
                <Input
                  label="Field Label"
                  value={editingField.label || ''}
                  onChange={(e) => {
                    const updated = { ...editingField, label: e.target.value };
                    setEditingField(updated);
                    updateField(editingField.id, { label: e.target.value });
                  }}
                  placeholder="Enter field label"
                />

                <Input
                  label="Placeholder Text"
                  value={editingField.placeholder || ''}
                  onChange={(e) => {
                    const updated = { ...editingField, placeholder: e.target.value };
                    setEditingField(updated);
                    updateField(editingField.id, { placeholder: e.target.value });
                  }}
                  placeholder="Enter placeholder text"
                />
                
                <Input
                  label="Help Text"
                  value={editingField.helpText || ''}
                  onChange={(e) => {
                    const updated = { ...editingField, helpText: e.target.value };
                    setEditingField(updated);
                    updateField(editingField.id, { helpText: e.target.value });
                  }}
                  placeholder="Optional help text for users"
                />

                {editingField.type === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Accepted File Types
                    </label>
                    <select
                      value={editingField.acceptedFileTypes || '*'}
                      onChange={(e) => {
                        const updated = { ...editingField, acceptedFileTypes: e.target.value };
                        setEditingField(updated);
                        updateField(editingField.id, { acceptedFileTypes: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="*">All Files</option>
                      <option value="image/*">Images Only</option>
                      <option value=".pdf">PDF Only</option>
                      <option value="image/*,.pdf">Images and PDF</option>
                      <option value=".doc,.docx">Word Documents</option>
                      <option value=".xls,.xlsx">Excel Files</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required-setting"
                    checked={editingField.required || false}
                    onChange={(e) => {
                      const updated = { ...editingField, required: e.target.checked };
                      setEditingField(updated);
                      updateField(editingField.id, { required: e.target.checked });
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="required-setting" className="text-sm text-gray-700 dark:text-gray-300">
                    Required field
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setEditingField(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FormBuilder;