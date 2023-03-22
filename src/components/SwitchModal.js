import React from "react";
import { Button, Modal } from "react-bootstrap";

const SwitchModal = (props) => {
  const { show, handleClose } = props;

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Switch Network</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Got to your wallet. You will be asked to switch network to mainnet
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SwitchModal;
