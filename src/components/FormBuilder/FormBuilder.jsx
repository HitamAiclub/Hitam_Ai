import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, Eye, Settings, Link, Image as ImageIcon, Type, Copy, ArrowUp, ArrowDown, ArrowRight, Download, Play, CheckCircle, Info } from "lucide-react";
import { uploadFormBuilderImage,uploadFormFiles} from "../../utils/cloudinary";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

const FormBuilder = ({ formSchema = [], onChange }) => {
  const [fields, setFields] = useState(formSchema);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editingFieldDraft, setEditingFieldDraft] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedField, setDraggedField] = useState(null);

  // Debug logging
  console.log("FormBuilder rendered with schema:", formSchema);
  console.log("FormBuilder fields state:", fields);
  console.log("Content Elements count:", formSchema?.filter(f => ["label", "image", "link"].includes(f.type)).length || 0);

  // Update fields when formSchema prop changes
  useEffect(() => {
    console.log("FormBuilder useEffect - formSchema changed:", formSchema);
    setFields(formSchema);
  }, [formSchema]);

  const fieldTypes = [
    { type: "text", label: "Short Text", icon: "📝", category: "input" },
    { type: "textarea", label: "Long Text", icon: "📄", category: "input" },
    { type: "email", label: "Email", icon: "📧", category: "input" },
    { type: "phone", label: "Phone Number", icon: "📞", category: "input" },
    { type: "number", label: "Number", icon: "🔢", category: "input" },
    { type: "select", label: "Dropdown", icon: "📋", category: "choice" },
    { type: "radio", label: "Multiple Choice", icon: "⚪", category: "choice" },
    { type: "checkbox", label: "Checkboxes", icon: "☑️", category: "choice" },
    { type: "file", label: "File Upload", icon: "📎", category: "input" },
    { type: "date", label: "Date", icon: "📅", category: "input" },
    { type: "time", label: "Time", icon: "⏰", category: "input" },
    { type: "url", label: "Website URL", icon: "🌐", category: "input" },
    { type: "label", label: "Description", icon: "📋", category: "content" },
    { type: "image", label: "Image", icon: "🖼️", category: "content" },
    { type: "link", label: "Link/Button", icon: "🔗", category: "content" }
  ];

  const addField = (type) => {
    console.log("addField called with type:", type);
    const fieldType = fieldTypes.find(f => f.type === type);
    console.log("Found field type:", fieldType);
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: fieldType?.category === "content" ? "" : `${fieldType?.label || "New Field"}`,
      required: false,
      placeholder: "",
      options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1", "Option 2"] : undefined,
      validation: {},
      helpText: "",
      acceptedFileTypes: type === "file" ? "*" : undefined,
      // Content field properties
      content: type === "label" ? "Add your description here. You can use [links](https://example.com) in your text." : "",
      contentType: type === "label" ? "markdown" : "text",
      imageUrl: type === "image" ? "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400" : undefined,
      altText: type === "image" ? "Sample image" : undefined,
      linkUrl: type === "link" ? "https://example.com" : undefined,
      linkText: type === "link" ? "Click here" : undefined,
      openInNewTab: type === "link" ? true : undefined,
      buttonStyle: type === "link" ? "primary" : undefined,
      buttonSize: type === "link" ? "md" : undefined,
      buttonWidth: type === "link" ? "auto" : undefined,
      showIcon: type === "link" ? false : undefined,
      iconType: type === "link" ? "arrow" : undefined,
      iconPosition: type === "link" ? "right" : undefined,
      fontSize: type === "label" ? "medium" : undefined,
      alignment: (type === "label" || type === "image" || type === "link") ? "left" : undefined,
      textColor: type === "label" ? "default" : undefined,
      fontWeight: type === "label" ? "normal" : undefined,
      italic: type === "label" ? false : undefined,
      underline: type === "label" ? false : undefined,
      imageSize: type === "image" ? "auto" : undefined,
      borderStyle: type === "image" ? "rounded" : undefined,
      shadow: type === "image" ? "none" : undefined,
      clickable: type === "image" ? false : undefined,
      clickUrl: type === "image" ? "" : undefined,
      useFileUpload: type === "image" ? false : undefined
    };
    
    const updatedFields = [...fields, newField];
    console.log("Updated fields:", updatedFields);
    setFields(updatedFields);
    onChange(updatedFields);
    console.log("Closing modal after adding field");
    setShowAddField(false);
    
    // Auto-open settings for content fields
    if (["label", "image", "link"].includes(type)) {
      console.log("Auto-opening settings for content field");
      setTimeout(() => setEditingField(newField), 100);
    }
  };

  // Only update fields array, not editingFieldDraft
  const updateField = (fieldId, updates) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const deleteField = (fieldId) => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      const updatedFields = fields.filter(field => field.id !== fieldId);
      setFields(updatedFields);
      onChange(updatedFields);
    }
  };

  const duplicateField = (field) => {
    const newField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: field.label + " (Copy)"
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
    
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(currentIndex, 1);
    updatedFields.splice(newIndex, 0, movedField);
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const FieldEditor = ({ field, index }) => {
    const fieldType = fieldTypes.find(f => f.type === field.type);
    // Only update fields array, not modal draft
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
        case "label":
          return (
            <div className={`${getAlignmentClass(field.alignment)} mb-4`}>
              <div 
                className={`${getFontSizeClass(field.fontSize)} ${getTextColorClass(field.textColor)} ${field.fontWeight === "bold" ? "font-bold" : field.fontWeight === "semibold" ? "font-semibold" : field.fontWeight === "medium" ? "font-medium" : ""} ${field.italic ? "italic" : ""} ${field.underline ? "underline" : ""}`}
                dangerouslySetInnerHTML={{ 
                  __html: field.contentType === "markdown" ? renderMarkdownLinks(field.content || "Add your description here...") : field.content || "Add your description here..." 
                }}
              />
            </div>
          );

        case "image":
          return (
            <div className={`${getAlignmentClass(field.alignment)} mb-4`}>
              {field.imageUrl ? (
                <img 
                  src={field.imageUrl} 
                  alt={field.altText || "Form image"} 
                  className={`${getImageSizeClass(field.imageSize)} ${getBorderStyleClass(field.borderStyle)} ${getShadowClass(field.shadow)} border border-gray-300 dark:border-gray-600`}
                  onError={(e) => {
                    e.target.src = "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400";
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          );

        case "link":
          return (
            <div className={`${getAlignmentClass(field.alignment)} mb-4`}>
              <span className={`transition-colors cursor-pointer ${getButtonStyleClass(field.buttonStyle)} ${getButtonSizeClass(field.buttonSize)} ${getButtonWidthClass(field.buttonWidth)} ${field.showIcon ? "inline-flex items-center gap-2" : ""}`}>
                {field.showIcon && field.iconPosition === "left" && (
                  <span className="text-sm">{getIcon(field.iconType)}</span>
                )}
                {field.linkText || "Click here"}
                {field.showIcon && field.iconPosition === "right" && (
                  <span className="text-sm">{getIcon(field.iconType)}</span>
                )}
              </span>
            </div>
          );

        case "select":
          return (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
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

        case "radio":
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
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

        case "checkbox":
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
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

        case "textarea":
          return (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
              </label>
              <textarea
                disabled
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          );

        case "file":
          return (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
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
                {field.label} {field.required && "*"}
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
              onClick={() => moveField(field.id, "up")}
              disabled={index === 0}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, "down")}
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
              onClick={() => {
                setEditingField(field);
                setEditingFieldDraft({ ...field });
              }}
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
        {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
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
      // Debug logging for content fields
      if (["label", "image", "link"].includes(field.type)) {
        console.log(`Rendering ${field.type} field:`, field);
      }

      // Handle content fields
      if (field.type === "label") {
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-6`}>
            <div 
              className={`${getFontSizeClass(field.fontSize)} ${getTextColorClass(field.textColor)} ${field.fontWeight === "bold" ? "font-bold" : field.fontWeight === "semibold" ? "font-semibold" : field.fontWeight === "medium" ? "font-medium" : ""} ${field.italic ? "italic" : ""} ${field.underline ? "underline" : ""}`}
              dangerouslySetInnerHTML={{ 
                __html: field.contentType === "markdown" ? renderMarkdownLinks(field.content || "") : field.content || "" 
              }}
            />
          </div>
        );
      }

      if (field.type === "image") {
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-6`}>
            {field.imageUrl && (
              <div className="relative">
                <img 
                  src={field.imageUrl} 
                  alt={field.altText || "Form image"} 
                  className={`${getImageSizeClass(field.imageSize)} ${getBorderStyleClass(field.borderStyle)} ${getShadowClass(field.shadow)} border border-gray-300 dark:border-gray-600 ${field.clickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                  onError={(e) => {
                    e.target.src = "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400";
                  }}
                  onClick={() => {
                    if (field.clickable) {
                      const url = field.clickUrl || field.imageUrl;
                      if (url) window.open(url, '_blank');
                    }
                  }}
                />
                {field.clickable && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    🔗
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      if (field.type === "link") {
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-6`}>
            <a
              href={field.linkUrl || "#"}
              target={field.openInNewTab ? "_blank" : "_self"}
              rel={field.openInNewTab ? "noopener noreferrer" : ""}
              className={`inline-block transition-colors ${getButtonStyleClass(field.buttonStyle)} ${getButtonSizeClass(field.buttonSize)} ${getButtonWidthClass(field.buttonWidth)} ${field.showIcon ? "inline-flex items-center gap-2" : ""}`}
            >
              {field.showIcon && field.iconPosition === "left" && (
                <span className="text-sm">{getIcon(field.iconType)}</span>
              )}
              {field.linkText || "Click here"}
              {field.showIcon && field.iconPosition === "right" && (
                <span className="text-sm">{getIcon(field.iconType)}</span>
              )}
            </a>
          </div>
        );
      }

      // Handle regular form fields
      const commonProps = {
        key: field.id,
        label: field.label + (field.required ? " *" : ""),
        value: formData[field.id] || "",
        onChange: (e) => setFormData({ ...formData, [field.id]: e.target.value }),
        placeholder: field.placeholder,
        required: field.required
      };

      switch (field.type) {
        case "textarea":
          return (
            <div key={field.id} className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
              </label>
              <textarea
                value={formData[field.id] || ""}
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

        case "select":
          return (
            <div key={field.id} className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
              </label>
              <select
                value={formData[field.id] || ""}
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

        case "radio":
          return (
            <div key={field.id} className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
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

        case "checkbox":
          return (
            <div key={field.id} className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
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

        case "file":
          return (
            <div key={field.id} className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && "*"}
              </label>
              <input
                type="file"
                required={field.required}
                accept={field.acceptedFileTypes || "*"}
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
                {field.label} {field.required && "*"}
              </label>
              <input
                type={field.type}
                value={formData[field.id] || ""}
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
      case "xs": return "text-xs";
      case "sm": return "text-sm";
      case "medium": return "text-base";
      case "lg": return "text-lg";
      case "xl": return "text-xl";
      case "2xl": return "text-2xl";
      case "3xl": return "text-3xl";
      default: return "text-base";
    }
  };

  const getAlignmentClass = (alignment) => {
    switch (alignment) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };

  const getTextColorClass = (color) => {
    switch (color) {
      case "primary": return "text-blue-600 dark:text-blue-400";
      case "secondary": return "text-gray-700 dark:text-gray-300";
      case "success": return "text-green-600 dark:text-green-400";
      case "warning": return "text-yellow-600 dark:text-yellow-400";
      case "danger": return "text-red-600 dark:text-red-400";
      case "muted": return "text-gray-500 dark:text-gray-400";
      default: return "text-gray-900 dark:text-white";
    }
  };

  const getImageSizeClass = (size) => {
    switch (size) {
      case "auto": return "max-w-full h-auto";
      case "small": return "max-w-sm h-auto";
      case "medium": return "max-w-md h-auto";
      case "large": return "max-w-lg h-auto";
      case "full": return "max-w-full h-auto";
      default: return "max-w-full h-auto";
    }
  };

  const getBorderStyleClass = (style) => {
    switch (style) {
      case "rounded": return "rounded-md";
      case "rounded-lg": return "rounded-lg";
      case "rounded-full": return "rounded-full";
      case "square": return "rounded-none";
      default: return "rounded-md";
    }
  };

  const getShadowClass = (shadow) => {
    switch (shadow) {
      case "sm": return "shadow-sm";
      case "md": return "shadow-md";
      case "lg": return "shadow-lg";
      case "xl": return "shadow-xl";
      default: return "shadow-none";
    }
  };

  const getButtonStyleClass = (style) => {
    switch (style) {
      case "primary": return "bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg inline-block";
      case "secondary": return "bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-lg inline-block";
      case "outline": return "border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg inline-block";
      case "link": return "text-blue-600 dark:text-blue-400 hover:underline inline-block";
      case "ghost": return "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg inline-block";
      case "danger": return "bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg inline-block";
      case "success": return "bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-lg inline-block";
      default: return "bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg inline-block";
    }
  };

  const getButtonSizeClass = (size) => {
    switch (size) {
      case "xs": return "text-xs px-2 py-1";
      case "sm": return "text-sm px-3 py-1";
      case "md": return "text-base px-4 py-2";
      case "lg": return "text-lg px-5 py-2";
      case "xl": return "text-xl px-6 py-3";
      default: return "text-base px-4 py-2";
    }
  };

  const getButtonWidthClass = (width) => {
    switch (width) {
      case "auto": return "";
      case "full": return "w-full";
      case "fit": return "w-fit";
      default: return "";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "arrow": return <ArrowRight className="w-4 h-4" />;
      case "external": return <Link className="w-4 h-4" />;
      case "download": return <Download className="w-4 h-4" />;
      case "play": return <Play className="w-4 h-4" />;
      case "plus": return <Plus className="w-4 h-4" />;
      case "check": return <CheckCircle className="w-4 h-4" />;
      case "info": return <Info className="w-4 h-4" />;
      default: return <ArrowRight className="w-4 h-4" />;
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
            
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit Form" : "Preview Form"}
          </Button>
          {!previewMode && (
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Add Field clicked, current state:", showAddField);
                setShowAddField(true);
                console.log("Add Field state set to true");
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
          {process.env.NODE_ENV === "development" && (
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
          console.log("Closing Add Field modal");
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
              {fieldTypes.filter(f => f.category === "input").map((fieldType) => (
                <motion.button
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Adding field type:", fieldType.type);
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
              {fieldTypes.filter(f => f.category === "choice").map((fieldType) => (
                <motion.button
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Adding choice field type:", fieldType.type);
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
              {fieldTypes.filter(f => f.category === "content").map((fieldType) => (
                <motion.button
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Adding content field type:", fieldType.type);
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
        onClose={() => {
          setEditingField(null);
          setEditingFieldDraft(null);
        }}
        title={`Edit ${fieldTypes.find(f => f.type === editingFieldDraft?.type)?.label || "Field"}`}
        size="lg"
      >
        {editingFieldDraft && (
          <div className="space-y-6">
            {/* Content Fields Settings */}
            {editingFieldDraft.type === "label" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Type
                  </label>
                  <select
                    value={editingFieldDraft.contentType || "text"}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, contentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Plain Text</option>
                    <option value="markdown">Markdown (with links)</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Text
                  </label>
                  <textarea
                    value={editingFieldDraft.content || ""}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, content: e.target.value })}
                    placeholder="Enter your content here. For markdown, you can use [link text](https://example.com)"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {editingFieldDraft.contentType === "markdown" && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Use [link text](https://example.com) to create clickable links
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Size
                    </label>
                      <select
                        value={editingFieldDraft.fontSize || "medium"}
                        onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, fontSize: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="xs">Extra Small</option>
                        <option value="sm">Small</option>
                        <option value="medium">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                        <option value="2xl">2XL</option>
                        <option value="3xl">3XL</option>
                      </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alignment
                    </label>
                    <select
                      value={editingFieldDraft.alignment || "left"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, alignment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Text Color
                    </label>
                    <select
                      value={editingFieldDraft.textColor || "default"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, textColor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="default">Default</option>
                      <option value="primary">Primary (Blue)</option>
                      <option value="secondary">Secondary (Gray)</option>
                      <option value="success">Success (Green)</option>
                      <option value="warning">Warning (Yellow)</option>
                      <option value="danger">Danger (Red)</option>
                      <option value="muted">Muted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Weight
                    </label>
                    <select
                      value={editingFieldDraft.fontWeight || "normal"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, fontWeight: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semi Bold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`italic-${editingFieldDraft.id}`}
                    checked={editingFieldDraft.italic || false}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, italic: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor={`italic-${editingFieldDraft.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                    Italic text
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`underline-${editingFieldDraft.id}`}
                    checked={editingFieldDraft.underline || false}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, underline: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor={`underline-${editingFieldDraft.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                    Underlined text
                  </label>
                </div>

                {/* Preview */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                  <div 
                    className={`${getFontSizeClass(editingFieldDraft.fontSize || "medium")} ${getAlignmentClass(editingFieldDraft.alignment || "left")} ${getTextColorClass(editingFieldDraft.textColor || "default")} ${editingFieldDraft.fontWeight === "bold" ? "font-bold" : editingFieldDraft.fontWeight === "semibold" ? "font-semibold" : editingFieldDraft.fontWeight === "medium" ? "font-medium" : ""} ${editingFieldDraft.italic ? "italic" : ""} ${editingFieldDraft.underline ? "underline" : ""}`}
                    dangerouslySetInnerHTML={{ 
                      __html: editingFieldDraft.contentType === "markdown" ? renderMarkdownLinks(editingFieldDraft.content || "") : editingFieldDraft.content || "Preview text will appear here" 
                    }}
                  />
                </div>
              </div>
            )}

            {editingFieldDraft.type === "image" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image Source
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`imageUrl-${editingFieldDraft.id}`}
                      name={`imageSource-${editingFieldDraft.id}`}
                      value="url"
                      checked={!editingFieldDraft.useFileUpload}
                      onChange={() => setEditingFieldDraft({ ...editingFieldDraft, useFileUpload: false })}
                      className="text-blue-600"
                    />
                      <label htmlFor={`imageUrl-${editingFieldDraft.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                        Use Image URL/Link
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`imageUpload-${editingFieldDraft.id}`}
                      name={`imageSource-${editingFieldDraft.id}`}
                      value="upload"
                      checked={editingFieldDraft.useFileUpload}
                      onChange={() => setEditingFieldDraft({ ...editingFieldDraft, useFileUpload: true })}
                      className="text-blue-600"
                    />
                      <label htmlFor={`imageUpload-${editingFieldDraft.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                        Upload Image File
                      </label>
                    </div>
                  </div>
                </div>

                {!editingFieldDraft.useFileUpload ? (
                  <Input
                    label="Image URL"
                    value={editingFieldDraft.imageUrl || ""}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, imageUrl: e.target.value })}
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
                            console.log("Uploading image file:", file.name, file.size, file.type);
                            // Use your Cloudinary upload utility
                            const uploadResult = await uploadFormBuilderImage(file); // This should return the Cloudinary URL
                            console.log("Upload result:", uploadResult);
                            
                            if (uploadResult && uploadResult.url) {
                              setEditingFieldDraft({ ...editingFieldDraft, imageUrl: uploadResult.url });
                            } else if (typeof uploadResult === 'string') {
                              // Handle case where function returns just the URL string
                              setEditingFieldDraft({ ...editingFieldDraft, imageUrl: uploadResult });
                            } else {
                              throw new Error("Invalid upload result format");
                            }
                          } catch (error) {
                            console.error("Error uploading image:", error);
                            alert(`Failed to upload image: ${error.message}. Please try again.`);
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
                  label="Alt Text (Accessibility)"
                  value={editingFieldDraft.altText || ""}
                  onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, altText: e.target.value })}
                  placeholder="Description of the image for screen readers"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image Size
                    </label>
                    <select
                      value={editingFieldDraft.imageSize || "auto"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, imageSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="auto">Auto (Original)</option>
                      <option value="small">Small (200px)</option>
                      <option value="medium">Medium (400px)</option>
                      <option value="large">Large (600px)</option>
                      <option value="full">Full Width</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alignment
                    </label>
                    <select
                      value={editingFieldDraft.alignment || "center"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, alignment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Border Style
                    </label>
                    <select
                      value={editingFieldDraft.borderStyle || "rounded"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, borderStyle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">No Border</option>
                      <option value="rounded">Rounded</option>
                      <option value="rounded-lg">Large Rounded</option>
                      <option value="rounded-full">Circular</option>
                      <option value="square">Square</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Shadow Effect
                    </label>
                    <select
                      value={editingFieldDraft.shadow || "none"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, shadow: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">No Shadow</option>
                      <option value="sm">Small Shadow</option>
                      <option value="md">Medium Shadow</option>
                      <option value="lg">Large Shadow</option>
                      <option value="xl">Extra Large Shadow</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`clickable-${editingFieldDraft.id}`}
                    checked={editingFieldDraft.clickable || false}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, clickable: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor={`clickable-${editingFieldDraft.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                    Make image clickable (opens in new tab)
                  </label>
                </div>

                {editingFieldDraft.clickable && (
                  <Input
                    label="Click URL (Optional)"
                    value={editingFieldDraft.clickUrl || ""}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, clickUrl: e.target.value })}
                    placeholder="https://example.com (leave empty to use image URL)"
                  />
                )}

                {editingFieldDraft.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                    <div className={`${getAlignmentClass(editingFieldDraft.alignment || "center")}`}>
                      <img 
                        src={editingFieldDraft.imageUrl} 
                        alt={editingFieldDraft.altText || "Preview"} 
                        className={`${getImageSizeClass(editingFieldDraft.imageSize || "auto")} ${getBorderStyleClass(editingFieldDraft.borderStyle || "rounded")} ${getShadowClass(editingFieldDraft.shadow || "none")} border border-gray-300 dark:border-gray-600 ${editingFieldDraft.clickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                        onError={(e) => {
                          e.target.src = "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400";
                        }}
                        onClick={() => {
                          if (editingFieldDraft.clickable) {
                            const url = editingFieldDraft.clickUrl || editingFieldDraft.imageUrl;
                            if (url) window.open(url, '_blank');
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {editingFieldDraft.type === "link" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Link URL"
                    value={editingFieldDraft.linkUrl || ""}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, linkUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <Input
                    label="Link Text"
                    value={editingFieldDraft.linkText || ""}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, linkText: e.target.value })}
                    placeholder="Click here"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Button Style
                    </label>
                    <select
                      value={editingFieldDraft.buttonStyle || "primary"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, buttonStyle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="primary">Primary Button</option>
                      <option value="secondary">Secondary Button</option>
                      <option value="outline">Outline Button</option>
                      <option value="link">Text Link</option>
                      <option value="ghost">Ghost Button</option>
                      <option value="danger">Danger Button</option>
                      <option value="success">Success Button</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Button Size
                    </label>
                    <select
                      value={editingFieldDraft.buttonSize || "md"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, buttonSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="xs">Extra Small</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alignment
                    </label>
                    <select
                      value={editingFieldDraft.alignment || "left"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, alignment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Width
                    </label>
                    <select
                      value={editingFieldDraft.buttonWidth || "auto"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, buttonWidth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="auto">Auto Width</option>
                      <option value="full">Full Width</option>
                      <option value="fit">Fit Content</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`newTab-${editingFieldDraft.id}`}
                    checked={editingFieldDraft.openInNewTab || false}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, openInNewTab: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor={`newTab-${editingFieldDraft.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                    Open in new tab
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`icon-${editingFieldDraft.id}`}
                    checked={editingFieldDraft.showIcon || false}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, showIcon: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor={`icon-${editingFieldDraft.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                    Show icon
                  </label>
                </div>

                {editingFieldDraft.showIcon && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Icon Type
                      </label>
                      <select
                        value={editingFieldDraft.iconType || "arrow"}
                        onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, iconType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="arrow">Arrow Right</option>
                        <option value="external">External Link</option>
                        <option value="download">Download</option>
                        <option value="play">Play</option>
                        <option value="plus">Plus</option>
                        <option value="check">Check</option>
                        <option value="info">Info</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Icon Position
                      </label>
                      <select
                        value={editingFieldDraft.iconPosition || "right"}
                        onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, iconPosition: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                  <div className={`${getAlignmentClass(editingFieldDraft.alignment || "left")}`}>
                    <button
                      className={`${getButtonStyleClass(editingFieldDraft.buttonStyle || "primary")} ${getButtonSizeClass(editingFieldDraft.buttonSize || "md")} ${getButtonWidthClass(editingFieldDraft.buttonWidth || "auto")} ${editingFieldDraft.showIcon ? "inline-flex items-center gap-2" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (editingFieldDraft.linkUrl) {
                          if (editingFieldDraft.openInNewTab) {
                            window.open(editingFieldDraft.linkUrl, '_blank');
                          } else {
                            window.location.href = editingFieldDraft.linkUrl;
                          }
                        }
                      }}
                    >
                      {editingFieldDraft.showIcon && editingFieldDraft.iconPosition === "left" && (
                        <span className="text-sm">{getIcon(editingFieldDraft.iconType || "arrow")}</span>
                      )}
                      {editingFieldDraft.linkText || "Preview Button"}
                      {editingFieldDraft.showIcon && editingFieldDraft.iconPosition === "right" && (
                        <span className="text-sm">{getIcon(editingFieldDraft.iconType || "arrow")}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Field Settings */}
            {!["label", "image", "link"].includes(editingFieldDraft.type) && (
              <div className="space-y-4">
                <Input
                  label="Field Label"
                  value={editingFieldDraft.label || ""}
                  onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, label: e.target.value })}
                  placeholder="Enter field label"
                />
                <Input
                  label="Placeholder Text"
                  value={editingFieldDraft.placeholder || ""}
                  onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
                <Input
                  label="Help Text"
                  value={editingFieldDraft.helpText || ""}
                  onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, helpText: e.target.value })}
                  placeholder="Optional help text for users"
                />
                {editingFieldDraft.type === "file" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Accepted File Types
                    </label>
                    <select
                      value={editingFieldDraft.acceptedFileTypes || "*"}
                      onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, acceptedFileTypes: e.target.value })}
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
                    checked={editingFieldDraft.required || false}
                    onChange={(e) => setEditingFieldDraft({ ...editingFieldDraft, required: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="required-setting" className="text-sm text-gray-700 dark:text-gray-300">
                    Required field
                  </label>
                </div>
                {/* Options for choice fields */}
                {(editingFieldDraft.type === "select" || editingFieldDraft.type === "radio" || editingFieldDraft.type === "checkbox") && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFieldDraft({ ...editingFieldDraft, options: [...(editingFieldDraft.options || []), `Option ${(editingFieldDraft.options?.length || 0) + 1}`] })}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {editingFieldDraft.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...editingFieldDraft.options];
                              newOptions[optionIndex] = e.target.value;
                              setEditingFieldDraft({ ...editingFieldDraft, options: newOptions });
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOptions = editingFieldDraft.options.filter((_, i) => i !== optionIndex);
                              setEditingFieldDraft({ ...editingFieldDraft, options: newOptions });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingField(null);
                  setEditingFieldDraft(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  updateField(editingFieldDraft.id, editingFieldDraft);
                  setEditingField(null);
                  setEditingFieldDraft(null);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FormBuilder;