import Link from 'next/link';
import React from 'react';

interface BreadcrumbItem {
  title: string,
  link?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-gray-600 mb-4">
      {items.map((item, index) => (
        <span className="flex space-x-2" key={index}>
          <a href={item.link ?? "/"}>{item.title}</a>
          {index < items.length - 1 && (
            <span className="text-gray-400">&raquo;</span>
          )}
        </span>
      ))}
    </nav>
  );
}
