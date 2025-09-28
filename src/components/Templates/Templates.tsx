import React, { useState } from 'react';
import { FileText, Code, Mail, Presentation, FileSpreadsheet, BookOpen, Plus, Download, Copy, Edit3 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  variables?: string[];
}

interface TemplatesProps {
  userRole: string;
}

export const Templates: React.FC<TemplatesProps> = ({ userRole }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  const templates: Template[] = [
    // Project Management Templates
    {
      id: 'pm-kickoff',
      name: 'Project Kickoff Document',
      category: 'Project Management',
      description: 'Template for starting new projects with clear objectives and timelines',
      icon: <Presentation className="w-5 h-5" />,
      content: 'Project kickoff template with objectives, timeline, and team roles',
      variables: ['project_name', 'start_date', 'end_date', 'team_members']
    },
    {
      id: 'pm-status',
      name: 'Status Report',
      category: 'Project Management',
      description: 'Weekly or monthly project status report template',
      icon: <FileText className="w-5 h-5" />,
      content: 'Status report with progress, blockers, and next steps',
      variables: ['period', 'progress', 'blockers', 'next_steps']
    },
    // Development Templates
    {
      id: 'dev-component',
      name: 'React Component',
      category: 'Development',
      description: 'Boilerplate for React functional component with TypeScript',
      icon: <Code className="w-5 h-5" />,
      content: 'React component template with props and state',
      variables: ['component_name', 'props', 'state']
    },
    {
      id: 'dev-api',
      name: 'API Documentation',
      category: 'Development',
      description: 'REST API endpoint documentation template',
      icon: <BookOpen className="w-5 h-5" />,
      content: 'API documentation with endpoints, parameters, and examples',
      variables: ['endpoint', 'method', 'parameters', 'response']
    },
    // Marketing Templates
    {
      id: 'mkt-email',
      name: 'Email Campaign',
      category: 'Marketing',
      description: 'Email marketing campaign template',
      icon: <Mail className="w-5 h-5" />,
      content: 'Email template with subject, body, and CTA',
      variables: ['subject', 'recipient_name', 'product', 'cta_link']
    },
    {
      id: 'mkt-blog',
      name: 'Blog Post',
      category: 'Marketing',
      description: 'SEO-optimized blog post structure',
      icon: <FileText className="w-5 h-5" />,
      content: 'Blog post with title, introduction, body, and conclusion',
      variables: ['title', 'keywords', 'target_audience']
    },
    // Design Templates
    {
      id: 'design-brief',
      name: 'Design Brief',
      category: 'Design',
      description: 'Project brief for design work',
      icon: <FileText className="w-5 h-5" />,
      content: 'Design brief with objectives, requirements, and deliverables',
      variables: ['project', 'objectives', 'deliverables', 'deadline']
    },
    // General Templates
    {
      id: 'gen-meeting',
      name: 'Meeting Notes',
      category: 'General',
      description: 'Meeting agenda and notes template',
      icon: <FileText className="w-5 h-5" />,
      content: 'Meeting notes with agenda, attendees, and action items',
      variables: ['date', 'attendees', 'agenda', 'action_items']
    },
    {
      id: 'gen-proposal',
      name: 'Business Proposal',
      category: 'General',
      description: 'Professional business proposal template',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      content: 'Business proposal with executive summary, solution, and pricing',
      variables: ['client', 'problem', 'solution', 'pricing']
    }
  ];

  const filteredTemplates = templates.filter(template => {
    if (userRole === 'pm') return ['Project Management', 'General'].includes(template.category);
    if (userRole === 'developer') return ['Development', 'General'].includes(template.category);
    if (userRole === 'designer') return ['Design', 'General'].includes(template.category);
    if (userRole === 'marketing') return ['Marketing', 'General'].includes(template.category);
    return true;
  });

  const categories = Array.from(new Set(filteredTemplates.map(t => t.category)));

  const generateFromTemplate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    try {
      // Prepare prompt with variables
      let prompt = `Generate content based on this template: ${selectedTemplate.name}\n`;
      prompt += `Description: ${selectedTemplate.description}\n`;

      if (selectedTemplate.variables) {
        prompt += '\nVariables:\n';
        selectedTemplate.variables.forEach(variable => {
          const value = templateVariables[variable] || `[${variable}]`;
          prompt += `- ${variable}: ${value}\n`;
        });
      }

      if (window.electronAPI && window.electronAPI.generateCode) {
        const response = await window.electronAPI.generateCode({
          prompt,
          language: selectedTemplate.category === 'Development' ? 'typescript' : 'text'
        });

        if (response.success) {
          setGeneratedContent(response.code);
        } else {
          setGeneratedContent('Failed to generate content: ' + response.error);
        }
      } else {
        // Demo content
        setGeneratedContent(`# ${selectedTemplate.name}\n\n## Generated Content\n\nThis is a demo generated content based on the ${selectedTemplate.name} template.\n\n${selectedTemplate.content}\n\n---\n\nNote: Connect to Claude SDK for real content generation.`);
      }
    } catch (error) {
      setGeneratedContent('Error generating content: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
    }
  };

  const saveAsFile = async () => {
    if (!generatedContent || !window.electronAPI) return;

    const extension = selectedTemplate?.category === 'Development' ? '.tsx' : '.md';
    const fileName = selectedTemplate?.name.replace(/\s+/g, '_').toLowerCase() + extension;

    try {
      const result = await window.electronAPI.saveFileDialog({
        defaultPath: fileName,
        filters: [
          { name: 'Markdown', extensions: ['md'] },
          { name: 'Text', extensions: ['txt'] },
          { name: 'TypeScript', extensions: ['tsx', 'ts'] },
          { name: 'JavaScript', extensions: ['jsx', 'js'] }
        ]
      });

      if (result.success && result.filePath) {
        await window.electronAPI.writeFile(result.filePath, generatedContent);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Template List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Templates</h2>
          <p className="text-gray-600 dark:text-gray-400">Pre-built templates for common tasks</p>
        </div>

        <button className="w-full mb-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Template
        </button>

        {/* Template Categories */}
        {categories.map(category => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{category}</h3>
            <div className="space-y-2">
              {filteredTemplates
                .filter(t => t.category === category)
                .map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setGeneratedContent('');
                      setTemplateVariables({});
                    }}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-gray-600 dark:text-gray-400">{template.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel - Template Details & Generation */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedTemplate ? (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedTemplate.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
            </div>

            {/* Template Variables */}
            {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Template Variables</h4>
                <div className="space-y-3">
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable}>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {variable.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        value={templateVariables[variable] || ''}
                        onChange={(e) => setTemplateVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                        placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateFromTemplate}
              disabled={isGenerating}
              className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate From Template'}
            </button>

            {/* Generated Content */}
            {generatedContent && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white">Generated Content</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={saveAsFile}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Save as file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit content"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-gray-100 overflow-auto max-h-96">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Template</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose a template from the list to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};