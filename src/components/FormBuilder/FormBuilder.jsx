import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Eye, Settings, Link, Image as ImageIcon, Type } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';

const FormBuilder = ({ formSchema = [], onChange }) => {
  const [fields, setFields] = useState(formSchema);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const fieldTypes = [
    { type: 'text', label: 'Short Text', icon: '📝' },
    { type: 'textarea', label: 'Long Text', icon: '📄' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'phone', label: 'Phone Number', icon: '📞' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'select', label: 'Dropdown', icon: '📋' },
    { type: 'radio', label: 'Multiple Choice', icon: '⚪' },
    { type: 'checkbox', label: 'Checkboxes', icon: '☑️' },
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'time', label: 'Time', icon: '⏰' },
    { type: 'url', label: 'Website URL', icon: '🌐' },
    { type: 'label', label: 'Label/Description', icon: '📋' },
    { type: 'image', label: 'Image Display', icon: '🖼️' },
    { type: 'link', label: 'Link/Button', icon: '🔗' }
  ];

  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `New ${fieldTypes.find(f => f.type === type)?.label || 'Field'}`,
      required: false,
      placeholder: '',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1'] : undefined,
      validation: {
        minLength: type === 'text' || type === 'textarea' ? '' : undefined,
        maxLength: type === 'text' || type === 'textarea' ? '' : undefined,
        pattern: type === 'text' ? '' : undefined
      },
      helpText: '',
      acceptedFileTypes: type === 'file' ? '*' : undefined,
      // New properties for content fields
      content: type === 'label' ? 'Add your description here...' : '',
      imageUrl: type === 'image' ? '' : undefined,
      linkUrl: type === 'link' ? '' : undefined,
      linkText: type === 'link' ? 'Click here' : undefined,
      fontSize: type === 'label' ? 'medium' : undefined,
      alignment: type === 'label' || type === 'image' ? 'left' : undefined
    };
    
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onChange(updatedFields);
    setShowAddField(false);
  };

  const updateField = (fieldId, updates) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const deleteField = (fieldId) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const moveField = (fromIndex, toIndex) => {
    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const FieldEditor = ({ field, onUpdate, onDelete }) => {
    const [localField, setLocalField] = useState(field);

    const handleUpdate = (updates) => {
      const updatedField = { ...localField, ...updates };
      setLocalField(updatedField);
      onUpdate(field.id, updates);
    };

    const addOption = () => {
      const newOptions = [...(localField.options || []), `Option ${(localField.options?.length || 0) + 1}`];
      handleUpdate({ options: newOptions });
    };

    const updateOption = (index, value) => {
      const newOptions = [...(localField.options || [])];
      newOptions[index] = value;
      handleUpdate({ options: newOptions });
    };

    const removeOption = (index) => {
      const newOptions = localField.options?.filter((_, i) => i !== index) || [];
      handleUpdate({ options: newOptions });
    };

    const renderContentFields = () => {
      switch (field.type) {
        case 'label':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content/Description
                </label>
                <textarea
                  value={localField.content || ''}
                  onChange={(e) => handleUpdate({ content: e.target.value })}
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
                    value={localField.fontSize || 'medium'}
                    onChange={(e) => handleUpdate({ fontSize: e.target.value })}
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
                    value={localField.alignment || 'left'}
                    onChange={(e) => handleUpdate({ alignment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          );

        case 'image':
          return (
            <div className="space-y-4">
              <Input
                label="Image URL"
                value={localField.imageUrl || ''}
                onChange={(e) => handleUpdate({ imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              
              <Input
                label="Alt Text (Optional)"
                value={localField.altText || ''}
                onChange={(e) => handleUpdate({ altText: e.target.value })}
                placeholder="Description of the image"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alignment
                </label>
                <select
                  value={localField.alignment || 'center'}
                  onChange={(e) => handleUpdate({ alignment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              
              {localField.imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                  <img 
                    src={localField.imageUrl} 
                    alt={localField.altText || 'Preview'} 
                    className="max-w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          );

        case 'link':
          return (
            <div className="space-y-4">
              <Input
                label="Link URL"
                value={localField.linkUrl || ''}
                onChange={(e) => handleUpdate({ linkUrl: e.target.value })}
                placeholder="https://example.com"
              />
              
              <Input
                label="Link Text"
                value={localField.linkText || ''}
                onChange={(e) => handleUpdate({ linkText: e.target.value })}
                placeholder="Click here"
              />
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`newTab-${field.id}`}
                  checked={localField.openInNewTab || false}
                  onChange={(e) => handleUpdate({ openInNewTab: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor={`newTab-${field.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                  Open in new tab
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Button Style
                </label>
                <select
                  value={localField.buttonStyle || 'primary'}
                  onChange={(e) => handleUpdate({ buttonStyle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="primary">Primary Button</option>
                  <option value="secondary">Secondary Button</option>
                  <option value="outline">Outline Button</option>
                  <option value="link">Text Link</option>
                </select>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
            <span className="text-2xl">
              {fieldTypes.find(f => f.type === field.type)?.icon}
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {fieldTypes.find(f => f.type === field.type)?.label}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingField(field)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(field.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Content fields for label, image, link */}
          {(field.type === 'label' || field.type === 'image' || field.type === 'link') ? (
            renderContentFields()
          ) : (
            <>
              <Input
                label="Field Label"
                value={localField.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                placeholder="Enter field label"
              />

              {field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'select' && (
                <Input
                  label="Placeholder Text"
                  value={localField.placeholder || ''}
                  onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              )}

              {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {localField.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`required-${field.id}`}
                  checked={localField.required || false}
                  onChange={(e) => handleUpdate({ required: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                  Required field
                </label>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const FormPreview = ({ fields }) => {
    const [formData, setFormData] = useState({});

    const renderMarkdownLinks = (text) => {
      if (!text) return text;
      
      // Simple markdown link parser: [text](url)
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

    const renderField = (field) => {
      // Handle content fields
      if (field.type === 'label') {
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-4`}>
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
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-4`}>
            {field.imageUrl && (
              <img 
                src={field.imageUrl} 
                alt={field.altText || 'Form image'} 
                className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                onError={(e) => {
                  e.target.style.display = 'none';
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
          <div key={field.id} className="mb-4">
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
            <div key={field.id} className="space-y-1">
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
            </div>
          );

        case 'select':
          return (
            <div key={field.id} className="space-y-1">
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
            </div>
          );

        case 'radio':
          return (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
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
            </div>
          );

        case 'checkbox':
          return (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
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
            </div>
          );

        case 'file':
          return (
            <div key={field.id} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && '*'}
              </label>
              <input
                type="file"
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );

        default:
          return <Input {...commonProps} type={field.type} />;
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Form Preview
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            This is how your form will appear to users
          </p>
        </div>
        
        <form className="space-y-6">
          {fields.map(renderField)}
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled>
              Submit Registration (Preview Mode)
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Registration Form Builder
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {previewMode ? 'Edit Form' : 'Preview Form'}
          </Button>
          {!previewMode && (
            <Button onClick={() => setShowAddField(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Field
            </Button>
          )}
        </div>
      </div>

      {previewMode ? (
        <FormPreview fields={fields} />
      ) : (
        <div>
          <AnimatePresence>
            {fields.map((field, index) => (
              <FieldEditor
                key={field.id}
                field={field}
                onUpdate={updateField}
                onDelete={deleteField}
              />
            ))}
          </AnimatePresence>

          {fields.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No form fields added yet. Click "Add Field" to get started.
              </p>
              <Button onClick={() => setShowAddField(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Field
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Field Modal */}
      <Modal
        isOpen={showAddField}
        onClose={() => setShowAddField(false)}
        title="Add Form Field"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Form Fields</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fieldTypes.filter(f => !['label', 'image', 'link'].includes(f.type)).map((fieldType) => (
                <motion.button
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addField(fieldType.type)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">{fieldType.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {fieldType.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content Elements</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fieldTypes.filter(f => ['label', 'image', 'link'].includes(f.type)).map((fieldType) => (
                <motion.button
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addField(fieldType.type)}
                  className="p-4 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">{fieldType.icon}</div>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
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
        title="Field Settings"
        size="md"
      >
        {editingField && (
          <div className="space-y-4">
            <Input
              label="Field Label"
              value={editingField.label}
              onChange={(e) => {
                const updated = { ...editingField, label: e.target.value };
                setEditingField(updated);
                updateField(editingField.id, { label: e.target.value });
              }}
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

            {!['label', 'image', 'link'].includes(editingField.type) && (
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
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FormBuilder;