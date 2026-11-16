import React from 'react';

export default function FilePicker({ id, inputRef, selectedFile, buttonText = 'Choose file', emptyText = 'No file selected', ...inputProps }) {
    return (
        <span className={`file-picker${selectedFile ? ' has-file' : ''}`}>
            <input ref={inputRef} id={id} type="file" {...inputProps} />
            <span className="file-picker-button">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 16V4m-5 5 5-5 5 5M5 14v5h14v-5" /></svg>
                {buttonText}
            </span>
            <span className={`file-picker-name${selectedFile ? ' has-file' : ''}`} title={selectedFile?.name || undefined}>
                {selectedFile?.name || emptyText}
            </span>
        </span>
    );
}
