import JSZip from 'jszip';
import { CodeFile, Codebase, UploadProgress } from '../types';

export class FileService {
  private static instance: FileService;

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  async processUpload(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Codebase> {
    const codebase: Codebase = {
      id: this.generateId(),
      name: file.name.replace(/\.(zip|tar|gz)$/i, ''),
      files: [],
      totalSize: file.size,
      uploadedAt: new Date(),
      status: 'uploading',
    };

    try {
      if (file.name.endsWith('.zip')) {
        codebase.files = await this.processZipFile(file, onProgress);
      } else {
        // Handle single file upload
        const content = await this.readFileContent(file);
        codebase.files = [{
          path: file.name,
          content,
          language: this.detectLanguage(file.name),
          size: file.size,
          lastModified: new Date(file.lastModified),
        }];
      }

      codebase.status = 'uploaded';
      return codebase;
    } catch (error) {
      codebase.status = 'error';
      throw error;
    }
  }

  private async processZipFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CodeFile[]> {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    const files: CodeFile[] = [];
    
    const fileEntries = Object.keys(zipContent.files);
    let processed = 0;

    for (const filePath of fileEntries) {
      const fileEntry = zipContent.files[filePath];
      
      if (!fileEntry.dir && this.isCodeFile(filePath)) {
        const content = await fileEntry.async('text');
        const fileInfo = {
          path: filePath,
          content,
          language: this.detectLanguage(filePath),
          size: content.length,
          lastModified: fileEntry.date || new Date(),
        };
        
        files.push(fileInfo);
      }
      
      processed++;
      
      if (onProgress) {
        onProgress({
          loaded: processed,
          total: fileEntries.length,
          percentage: (processed / fileEntries.length) * 100,
          status: `Processing ${filePath}...`,
        });
      }
    }

    return files;
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private isCodeFile(filePath: string): boolean {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs',
      '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.dart',
      '.html', '.css', '.scss', '.less', '.vue', '.svelte', '.json',
      '.xml', '.yaml', '.yml', '.md', '.sql', '.sh', '.bash'
    ];
    
    return codeExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop() || '';
    
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'dart': 'dart',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'vue': 'vue',
      'svelte': 'svelte',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
    };
    
    return languageMap[ext] || 'text';
  }

  async exportImprovedCodebase(codebase: Codebase, improvedFiles: CodeFile[]): Promise<Blob> {
    const zip = new JSZip();
    const folder = zip.folder(`${codebase.name}-improved`);
    
    if (folder) {
      for (const file of improvedFiles) {
        folder.file(file.path, file.content);
      }
    }
    
    return await zip.generateAsync({ type: 'blob' });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}