import React, { useState } from 'react';
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
  Input,
  useToast,
  Text,
} from '@chakra-ui/react';

interface RequestRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RequestRefundModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestRefundModalProps) {
  const [reason, setReason] = useState('');
  const toast = useToast();

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: 'Please provide a reason',
        status: 'error',
        duration: 2000,
        position: 'top',
      });
      return;
    }
    onSubmit(reason);
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Request Refund</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4} color="gray.500" fontSize="sm">
            Please state the reason for this refund. Once requested, an Admin
            must approve it. If approved, the amount will be deducted from your
            wallet balance.
          </Text>
          <FormControl>
            <FormLabel>Refund Reason</FormLabel>
            <Input
              placeholder="e.g., Customer cancelled order, Out of stock..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="orange" onClick={handleSubmit}>
            Submit Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
