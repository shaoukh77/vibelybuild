/**
 * File Tree Component - Fixed Version
 * Displays hierarchical file/folder structure with expand/collapse
 */

'use client';

import { useState } from 'react';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeProps {
  node: FileNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  depth?: number;
}

export function FileTree({ node, selectedFile, onSelectFile, depth = 0 }: FileTreeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onSelectFile(node.path);
    }
  };

  const isSelected = node.type === 'file' && selectedFile === node.path;
  const paddingLeft = depth * 12 + 8;

  // Get file icon based on extension
  const getFileIcon = (name: string) => {
    if (node.type === 'folder') {
      return isExpanded ? '📂' : '📁';
    }

    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return '📘';
      case 'jsx':
      case 'js':
        return '📗';
      case 'css':
        return '🎨';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'html':
        return '🌐';
      case 'svg':
      case 'png':
      case 'jpg':
      case 'jpeg':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <div>
      {/* Current node */}
      <div
        onClick={handleClick}
        className={`
          text-xs font-mono cursor-pointer px-2 py-1.5 rounded transition-all flex items-center gap-1.5
          ${isSelected
            ? 'bg-purple-500/30 text-white font-semibold'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
          }
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <span className="text-sm">{getFileIcon(node.name)}</span>
        <span className="truncate flex-1">{node.name}</span>
        {node.type === 'folder' && node.children && node.children.length > 0 && (
          <span className="text-white/40 text-[10px]">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </div>

      {/* Children (if folder and expanded) */}
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTree
              key={child.path || `${child.name}-${index}`}
              node={child}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * File Tree Root Component
 */
interface FileTreeRootProps {
  tree: FileNode | null;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  isLoading?: boolean;
}

export function FileTreeRoot({ tree, selectedFile, onSelectFile, isLoading }: FileTreeRootProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-8">
        <div className="text-white/50 text-xs animate-pulse">Loading files...</div>
      </div>
    );
  }

  if (!tree || !tree.children || tree.children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="w-12 h-12 mb-3 bg-white/5 rounded-full flex items-center justify-center">
          <span className="text-2xl">📁</span>
        </div>
        <p className="text-white/50 text-xs">No files yet</p>
        <p className="text-white/30 text-[10px] mt-1">
          Files will appear after build completes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {tree.children.map((child, index) => (
        <FileTree
          key={child.path || `${child.name}-${index}`}
          node={child}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          depth={0}
        />
      ))}
    </div>
  );
}
