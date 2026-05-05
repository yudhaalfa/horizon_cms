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

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

export default function TopUpModal({
  isOpen,
  onClose,
  onSubmit,
}: TopUpModalProps) {
  const [displayAmount, setDisplayAmount] = useState('');
  const toast = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const rawValue = e.target.value.replace(/\D/g, '');

    
    if (rawValue) {
      const formattedValue = new Intl.NumberFormat('id-ID').format(
        Number(rawValue),
      );
      setDisplayAmount(formattedValue);
    } else {
      setDisplayAmount('');
    }
  };

  const handleSubmit = () => {
    
    const rawNumber = Number(displayAmount.replace(/\./g, ''));

    if (!rawNumber || rawNumber <= 0) {
      toast({
        title: 'Please enter a valid amount',
        status: 'error',
        duration: 2000,
        position: 'top',
      });
      return;
    }

    onSubmit(rawNumber);
    setDisplayAmount(''); 
    onClose();
  };

  const handleClose = () => {
    setDisplayAmount(''); 
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Request Wallet Top-Up</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4} color="gray.500" fontSize="sm">
            Enter the amount you wish to add to your wallet. This request will
            be sent to an Admin for approval.
          </Text>
          <FormControl>
            <FormLabel>Top-Up Amount (IDR)</FormLabel>
            <Input
              type="text" 
              inputMode="numeric" 
              placeholder="e.g. 5.000.000"
              value={displayAmount}
              onChange={handleAmountChange}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button colorScheme="green" onClick={handleSubmit}>
            Request Top-Up
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
