import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Textarea, Text } from '@chakra-ui/react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onSubmit: (reason: string) => void;
}

export default function RefundModal({ isOpen, onClose, transaction, onSubmit }: RefundModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(reason);
    setReason(''); // clear after submit
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Request Refund</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>
            Are you sure you want to request a refund for <b>{transaction?.id}</b> ({transaction?.customerName})?
          </Text>
          <FormControl isRequired>
            <FormLabel>Reason for Refund</FormLabel>
            <Textarea 
              placeholder="e.g., Customer cancelled order..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="red" onClick={handleSubmit} isDisabled={!reason}>Submit Request</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
