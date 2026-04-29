import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Text,
} from '@chakra-ui/react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onSubmit: () => void;
}

export default function RefundModal({
  isOpen,
  onClose,
  transaction,
  onSubmit,
}: RefundModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Request Refund</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>
            Are you sure you want to request a refund for{' '}
            <b>{transaction?.id}</b> ({transaction?.customer})?
          </Text>
          <FormControl isRequired>
            <FormLabel>Reason for Refund</FormLabel>
            <Textarea placeholder="e.g., Customer cancelled order..." />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={onSubmit}>
            Submit Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
