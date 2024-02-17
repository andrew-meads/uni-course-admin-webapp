import React from "react";
import { useContext, useState } from "react";
import { Modal, Button } from "react-bootstrap";

const DialogContext = React.createContext();

export function useDialog() {
  return useContext(DialogContext);
}

export function DialogProvider({ children }) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isStatic, setStatic] = useState(false);
  const [buttons, setButtons] = useState(undefined);

  const handleClose = () => setShow(false);

  function showDialog({ title, content, isStatic, buttons }) {
    setTitle(title ?? "");
    setContent(content ?? "");
    setStatic(isStatic === undefined ? false : isStatic);
    setButtons(buttons ?? [{ variant: "primary", text: "OK", onClick: handleClose }]);
    setShow(true);
  }

  return (
    <DialogContext.Provider value={showDialog}>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop={isStatic ? "static" : undefined}
        keyboard={!isStatic}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title ?? "Error"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{content}</Modal.Body>
        <Modal.Footer>
          {buttons
            ? buttons.map((b, i) => (
                <Button key={i} variant={b.variant} onClick={b.onClick}>
                  {b.text}
                </Button>
              ))
            : undefined}
        </Modal.Footer>
      </Modal>

      {children}
    </DialogContext.Provider>
  );
}
