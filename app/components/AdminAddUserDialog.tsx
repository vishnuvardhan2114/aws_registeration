import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

const AdminAddUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [batchYear, setBatchYear] = useState("");

  const addStudent = useMutation(api.students.addStudent);

  const onClose = () => {
    setIsOpen(false);
  };

  const handleAddStudent = async () => {
    try {
      await addStudent({
        name,
        email,
        phoneNumber,
        dateOfBirth,
        batchYear: parseInt(batchYear, 10),
      });
      onClose();
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Input
            placeholder="Date of Birth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <Input
            placeholder="Batch Year"
            value={batchYear}
            onChange={(e) => setBatchYear(e.target.value)}
          />
          <Button onClick={handleAddStudent}>Add Student</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAddUserDialog;
