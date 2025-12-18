// Shared page styles for all CRUD components
export const PAGE_STYLES = `
  .page-container {
    padding: 0;
  }

  /* Page Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
  }

  .header-text h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .header-text p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0.25rem 0 0 0;
  }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 1rem 1.5rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
  }

  .search-input {
    width: 300px;
  }

  .filter-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .total-count {
    font-size: 0.875rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
  }

  /* Table Container */
  .table-container {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
  }

  /* Table Styles - Fixed Layout */
  :host ::ng-deep .modern-table {
    width: 100%;
  }

  :host ::ng-deep .modern-table .p-datatable-table {
    table-layout: fixed;
    width: 100%;
  }

  :host ::ng-deep .modern-table .p-datatable-thead > tr > th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0.875rem 1rem;
    border: none;
    border-bottom: 2px solid #e2e8f0;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :host ::ng-deep .modern-table .p-datatable-tbody > tr > td {
    padding: 0.875rem 1rem;
    border: none;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :host ::ng-deep .modern-table .p-datatable-tbody > tr:hover {
    background: #f8fafc;
  }

  :host ::ng-deep .modern-table .p-datatable-tbody > tr:last-child > td {
    border-bottom: none;
  }

  /* Column Widths */
  :host ::ng-deep .modern-table th.col-code,
  :host ::ng-deep .modern-table td.col-code {
    width: 100px;
    min-width: 100px;
  }

  :host ::ng-deep .modern-table th.col-name,
  :host ::ng-deep .modern-table td.col-name {
    width: auto;
    min-width: 150px;
  }

  :host ::ng-deep .modern-table th.col-status,
  :host ::ng-deep .modern-table td.col-status {
    width: 90px;
    min-width: 90px;
    text-align: center;
  }

  :host ::ng-deep .modern-table th.col-count,
  :host ::ng-deep .modern-table td.col-count {
    width: 80px;
    min-width: 80px;
    text-align: center;
  }

  :host ::ng-deep .modern-table th.col-actions,
  :host ::ng-deep .modern-table td.col-actions {
    width: 100px;
    min-width: 100px;
    text-align: center;
  }

  .code-badge {
    display: inline-block;
    background: #e0e7ff;
    color: #4338ca;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-family: 'Courier New', monospace;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .text-center {
    text-align: center !important;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 0.125rem;
  }

  :host ::ng-deep .action-buttons .p-button {
    width: 32px;
    height: 32px;
  }

  /* Name Cell */
  .name-cell {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .name-primary {
    font-weight: 500;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .name-desc {
    font-size: 0.6875rem;
    color: #94a3b8;
    margin-top: 0.125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Badges */
  .parent-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: #fef3c7;
    color: #92400e;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .parent-badge i {
    font-size: 0.625rem;
    flex-shrink: 0;
  }

  .no-parent, .no-data {
    color: #cbd5e1;
  }

  .count-badge {
    display: inline-block;
    background: #f1f5f9;
    color: #475569;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Empty State */
  .empty-state {
    padding: 4rem 2rem !important;
  }

  .empty-content {
    text-align: center;
  }

  .empty-content i {
    font-size: 4rem;
    color: #cbd5e1;
    margin-bottom: 1rem;
  }

  .empty-content h4 {
    font-size: 1.125rem;
    color: #475569;
    margin: 0 0 0.5rem 0;
  }

  .empty-content p {
    color: #94a3b8;
    margin: 0 0 1.5rem 0;
  }

  /* Dialog Styles */
  :host ::ng-deep .modern-dialog .p-dialog-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  :host ::ng-deep .modern-dialog .p-dialog-content {
    padding: 1.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .form-field.full-width {
    grid-column: span 2;
  }

  .form-field label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .required {
    color: #ef4444;
  }

  .field-hint {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.375rem;
  }

  .form-field-switch {
    grid-column: span 2;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }

  .form-field-switch label {
    font-size: 0.875rem;
    color: #475569;
    margin-bottom: 0;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  :host ::ng-deep .w-full {
    width: 100%;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .form-field.full-width,
    .form-field-switch {
      grid-column: span 1;
    }
  }
`;
