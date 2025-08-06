import { FileGridItem } from './file-grid-item';
import React from 'react';
export function FileGrid({
  entries
}) {
  return <div className="file-grid-container">
      <div className="file-grid">
        {entries.map(entry => {
        return <FileGridItem key={entry.id} entry={entry} />;
      })}
      </div>
    </div>;
}