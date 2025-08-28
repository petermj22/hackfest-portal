import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentUpload = ({ documents, onUpload, onRemove }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    
    // Mock upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    Array.from(files)?.forEach(file => {
      const mockDocument = {
        id: Date.now() + Math.random(),
        name: file?.name,
        size: file?.size,
        type: file?.type,
        uploadDate: new Date(),
        status: 'uploaded'
      };
      onUpload(mockDocument);
    });
    
    setUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return 'FileText';
    if (type?.includes('image')) return 'Image';
    if (type?.includes('document') || type?.includes('word')) return 'FileText';
    if (type?.includes('sheet') || type?.includes('excel')) return 'FileSpreadsheet';
    return 'File';
  };

  return (
    <div className="glass rounded-xl p-6 neon-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-orbitron font-bold text-foreground">
          Team Documents
        </h3>
        <Icon name="Upload" size={24} className="text-primary" />
      </div>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth mb-6 ${
          dragActive 
            ? 'border-primary bg-primary/5 neon-glow' :'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin mx-auto">
              <Icon name="Loader2" size={32} className="text-primary" />
            </div>
            <p className="text-muted-foreground font-inter">Uploading documents...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Icon name="Upload" size={48} className="text-muted-foreground mx-auto" />
            <div>
              <p className="text-foreground font-inter font-medium mb-2">
                Drag and drop files here
              </p>
              <p className="text-sm text-muted-foreground font-inter mb-4">
                or click to browse files
              </p>
              <Button
                variant="outline"
                iconName="FolderOpen"
                iconPosition="left"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Browse Files
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-inter">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>
        )}
      </div>
      <input
        id="file-input"
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => handleFiles(e?.target?.files)}
        className="hidden"
      />
      {/* Document List */}
      {documents?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-inter font-medium text-muted-foreground uppercase tracking-wide">
            Uploaded Documents
          </h4>
          
          {documents?.map((doc) => (
            <div key={doc?.id} className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-smooth">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Icon 
                    name={getFileIcon(doc?.type)} 
                    size={20} 
                    className="text-primary shrink-0 mt-1" 
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-inter font-medium text-foreground truncate">
                      {doc?.name}
                    </h5>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-muted-foreground font-jetbrains">
                        {formatFileSize(doc?.size)}
                      </span>
                      <span className="text-sm text-muted-foreground font-inter">
                        {new Date(doc.uploadDate)?.toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="Download"
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="Trash2"
                    onClick={() => onRemove(doc?.id)}
                    className="text-error hover:text-error"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;