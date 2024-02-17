import clsx from "clsx";
import styles from "./FileUploadDragDrop.module.css";
import { useRef, useState } from "react";

/**
 * A component which allows users to drag and drop files. Exposes an onFilesDropped event
 * which can be handled in order to process those files.
 *
 * Adapted from code found on MDN.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
 *
 * @param {{mimeType: string | string[], onFilesDropped: function(File[])}} props component props.
 */
export default function FileUploadDragDrop({ mimeType, onFilesDropped, children }) {
  const mimeTypes = typeof mimeType === "string" ? [mimeType] : mimeType;
  const inputRef = useRef();
  const [isDragging, setDragging] = useState(false);

  /**
   * Handles a "drop" event onto this component.
   *
   * @param {React.DragEvent<HTMLDivElement>} e
   */
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);

    // Array to store files which have been dropped
    /** @type File[] */
    let files = [];

    // Check the "items" list in the event. Goes through and adds all files here to the array.
    if (e.dataTransfer.items) {
      const items = [...e.dataTransfer.items];
      items.forEach((i) => {
        if (i.kind === "file") files.push(i.getAsFile());
      });
    }

    // Check the "files" list in the event.
    else {
      files = [...e.dataTransfer.files];
    }

    // Filter mime types
    files = files.filter((f) => mimeTypes.includes(f.type));

    handleFilesDropped(files);
  }

  /**
   * Inform our parent that files have been dropped (or selected)
   */
  function handleFilesDropped(files) {
    // console.log(files);
    inputRef.current.value = null;
    if (!files || files.length === 0) return;
    if (onFilesDropped) onFilesDropped(files);
  }

  return (
    <>
      <div
        className={clsx(styles.dropDiv, isDragging && styles.isDragging)}
        onClick={() => inputRef.current.click()}
        onDragEnter={() => setDragging(true)}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {children ?? (
          <>
            <span>Drag and drop your file here</span>
            <span>(or click to open a file picker)</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        accept={mimeTypes.join(",")}
        onChange={(e) => handleFilesDropped([...e.target.files])}
      />
    </>
  );
}
