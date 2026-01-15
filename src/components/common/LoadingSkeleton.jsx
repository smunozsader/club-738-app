import React from 'react';
import './LoadingSkeleton.css';

export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-circle"></div>
        <div className="skeleton-text-group">
          <div className="skeleton-line skeleton-line-title"></div>
          <div className="skeleton-line skeleton-line-subtitle"></div>
        </div>
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line skeleton-line-short"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="skeleton-table-row">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index}>
          <div className="skeleton-line"></div>
        </td>
      ))}
    </tr>
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="skeleton-document-card">
      <div className="skeleton-doc-header">
        <div className="skeleton-circle skeleton-circle-sm"></div>
        <div className="skeleton-text-group">
          <div className="skeleton-line skeleton-line-title"></div>
          <div className="skeleton-line skeleton-line-subtitle"></div>
        </div>
        <div className="skeleton-badge"></div>
      </div>
      <div className="skeleton-doc-body">
        <div className="skeleton-line"></div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="skeleton-profile">
      <div className="skeleton-circle skeleton-circle-lg"></div>
      <div className="skeleton-profile-info">
        <div className="skeleton-line skeleton-line-title"></div>
        <div className="skeleton-line skeleton-line-subtitle"></div>
        <div className="skeleton-line skeleton-line-short"></div>
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5, type = 'card' }) {
  const SkeletonComponent = type === 'document' ? DocumentCardSkeleton : CardSkeleton;
  
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <table className="skeleton-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <div className="skeleton-line"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowSkeleton key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="skeleton-stat-card">
      <div className="skeleton-circle skeleton-circle-sm"></div>
      <div className="skeleton-stat-content">
        <div className="skeleton-line skeleton-line-number"></div>
        <div className="skeleton-line skeleton-line-subtitle"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-stats-grid">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="skeleton-table-wrapper">
        <div className="skeleton-line skeleton-line-title"></div>
        <TableSkeleton rows={8} columns={6} />
      </div>
    </div>
  );
}

export default {
  Card: CardSkeleton,
  TableRow: TableRowSkeleton,
  DocumentCard: DocumentCardSkeleton,
  Profile: ProfileSkeleton,
  List: ListSkeleton,
  Table: TableSkeleton,
  StatCard: StatCardSkeleton,
  Dashboard: DashboardSkeleton
};
