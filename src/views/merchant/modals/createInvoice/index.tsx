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
  VStack,
} from '@chakra-ui/react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    customerName: string;
    description: string;
    amount: number;
  }) => void;
}

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreate,
}: CreateInvoiceModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');

  const toast = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue) {
      setDisplayAmount(new Intl.NumberFormat('id-ID').format(Number(rawValue)));
    } else {
      setDisplayAmount('');
    }
  };

  const handleSubmit = () => {
    const rawAmount = Number(displayAmount.replace(/\./g, ''));

    if (
      !customerName.trim() ||
      !description.trim() ||
      !rawAmount ||
      rawAmount <= 0
    ) {
      toast({
        title: 'Validation Error',
        description:
          'All fields are mandatory. Please fill in the Customer Name, Description, and a valid Price.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    onCreate({
      customerName: customerName.trim(),
      description: description.trim(),
      amount: rawAmount,
    });

    setCustomerName('');
    setDescription('');
    setDisplayAmount('');
    onClose();
  };

  const handleClose = () => {
    setCustomerName('');
    setDescription('');
    setDisplayAmount('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Customer Name</FormLabel>
              <Input
                placeholder="e.g. Budi Santoso"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Item Description</FormLabel>
              <Input
                placeholder="e.g. Premium T-Shirt Black"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Price / Amount (IDR)</FormLabel>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 150.000"
                value={displayAmount}
                onChange={handleAmountChange}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Generate Link
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
