import React from 'react';

interface BreadcrumbProps {
  items: string[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-gray-600 mb-4">
      {items.map((item, index) => (
        <span className="flex space-x-2" key={index}>
          <span>{item}</span>
          {index < items.length - 1 && (
            <span className="text-gray-400">&raquo;</span>
          )}
        </span>
      ))}
    </nav>
  );
}
