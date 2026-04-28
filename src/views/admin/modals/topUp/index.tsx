import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export default function TopUpModal({ isOpen, onClose, onConfirm }: TopUpModalProps) {
  const [amount, setAmount] = useState('');

  const handleConfirm = () => {
    onConfirm(Number(amount));
    setAmount('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Top Up Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Amount (IDR)</FormLabel>
            <Input type="number" placeholder="e.g. 50000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleConfirm} isDisabled={!amount}>Confirm Payment</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
