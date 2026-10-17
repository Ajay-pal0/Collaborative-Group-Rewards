import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#78716c] mb-2">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" />}
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-[#0c0a09] transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-[#0c0a09] font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#0c0a09]">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-[#78716c] max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
