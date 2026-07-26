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
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftAddon,
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
  const [errors, setErrors] = useState<{
    customerName?: string;
    description?: string;
    amount?: string;
  }>({});

  const toast = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue) {
      setDisplayAmount(new Intl.NumberFormat('id-ID').format(Number(rawValue)));
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: undefined }));
      }
    } else {
      setDisplayAmount('');
    }
  };

  const handleSubmit = () => {
    const rawAmount = Number(displayAmount.replace(/\./g, ''));
    const newErrors: {
      customerName?: string;
      description?: string;
      amount?: string;
    } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Nama Customer wajib diisi';
    }

    if (!description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    }

    if (!rawAmount || rawAmount <= 0) {
      newErrors.amount = 'Harga harus lebih besar dari 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: 'Validation Error',
        description:
          'Isi semua field yang wajib diisi',
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

    handleClose();
  };

  const handleClose = () => {
    setCustomerName('');
    setDescription('');
    setDisplayAmount('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="16px">
        <ModalHeader fontWeight="bold">Create New Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!errors.customerName}>
              <FormLabel>Customer Name</FormLabel>
              <Input
                placeholder="e.g. PT Mitra Sejahtera"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) {
                    setErrors((prev) => ({ ...prev, customerName: undefined }));
                  }
                }}
              />
              {errors.customerName && (
                <FormErrorMessage>{errors.customerName}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.description}>
              <FormLabel>Item Description</FormLabel>
              <Input
                placeholder="e.g. Software License Subscription"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
              />
              {errors.description && (
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.amount}>
              <FormLabel>Price / Amount (IDR)</FormLabel>
              <InputGroup>
                <InputLeftAddon>Rp</InputLeftAddon>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={displayAmount}
                  onChange={handleAmountChange}
                />
              </InputGroup>
              {errors.amount && (
                <FormErrorMessage>{errors.amount}</FormErrorMessage>
              )}
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
