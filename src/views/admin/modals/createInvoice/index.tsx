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
  Input,
  VStack,
  Textarea,
} from '@chakra-ui/react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (invoice: any) => void;
}

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreate,
}: CreateInvoiceModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `INV-${Math.floor(Math.random() * 1000) + 100}`;
    const newInvoice = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      amount: 100000, // Simulated amount
      status: 'Pending',
      link: `https://pay.yourapp.com/${newId}`,
    };
    onCreate(newInvoice);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Invoice</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Customer Name</FormLabel>
                <Input placeholder="John Doe" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input type="number" placeholder="150000" />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea placeholder="Payment for services..." />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Generate Link
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
