'use client';

import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmDialogProps = {
  /** The button or trigger element */
  children: ReactNode;
  /** The dialog title */
  title?: string;
  /** The dialog body text */
  description?: string;
  /** Whether the confirm action is destructive */
  destructive?: boolean;
  /** Confirm button label */
  confirmText?: string;
  /** Cancel button label */
  cancelText?: string;
  /** Callback to run when confirmed */
  onConfirm: () => void;
};

export default function ConfirmDialog({
  children,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  destructive = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
        <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{cancelText}</Button>
            </DialogClose>
            <Button variant={destructive ? "destructive" : "default"} type="submit">{confirmText}</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
