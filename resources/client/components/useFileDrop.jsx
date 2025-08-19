import { useState, useCallback } from "react";

async function readEntries(entry, path = '') {
    const reader = entry.createReader();
    const results = [];
    const entries = await new Promise((resolve) => {
        reader.readEntries((entries) => resolve(entries));
    });

    for (const subEntry of entries) {
        if (subEntry.isFile) {
            results.push(await new Promise((resolve) => {
                subEntry.file((file) => {
                    const newFile = new File([file], file.name, { type: file.type });
                    Object.defineProperty(newFile, 'webkitRelativePath', {
                        value: `${path}${file.name}`,
                        writable: false,
                        enumerable: true,
                        configurable: true
                    });
                    resolve(newFile);
                });
            }));
        } else if (subEntry.isDirectory) {
            const subEntries = await readEntries(subEntry, `${path}${subEntry.name}/`);
            results.push(...subEntries);
        }
    }
    return results;
}

export function useFileDrop(onDrop) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const items = Array.from(e.dataTransfer.items);
        const newItems = [];

        for (const item of items) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                if (entry.isFile) {
                    newItems.push(await new Promise((resolve) => entry.file(resolve)));
                } else if (entry.isDirectory) {
                    const filesInFolder = await readEntries(entry);
                    newItems.push({
                        folderName: entry.name,
                        files: filesInFolder,
                    });
                }
            }
        }

        if (newItems.length > 0) {
            onDrop(newItems);
        }
    }, [onDrop]);

    return { isDragging, handleDragOver, handleDragLeave, handleDrop };
}