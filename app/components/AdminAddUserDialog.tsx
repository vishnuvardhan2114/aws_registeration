import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

const AdminAddUserDialog = ({
  isOpen,
  onOpen,
  onClose,
  isEdit,
  selectedStudentData,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [batchYear, setBatchYear] = useState("");

  const addStudent = useMutation(api.students.addOrUpdateStudent);

  const handleAddStudent = async () => {
    if (!name && !email && !phoneNumber && !dateOfBirth && !batchYear) {
      alert("Please fill all the details");
      return;
    }

    try {
      await addStudent({
        name,
        email,
        phoneNumber,
        dateOfBirth,
        batchYear: parseInt(batchYear, 10),
      });
      onClose(false);
      setName("");
      setEmail("");
      setPhoneNumber("");
      setDateOfBirth("");
      setBatchYear("");
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  useEffect(() => {
    if (isEdit && selectedStudentData) {
      setName(selectedStudentData?.name);
      setEmail(selectedStudentData?.email);
      setPhoneNumber(selectedStudentData?.phoneNumber);
      setDateOfBirth(selectedStudentData?.dateOfBirth);
      setBatchYear(selectedStudentData?.batchYear?.toString());
    } else {
      setName("");
      setEmail("");
      setPhoneNumber("");
      setDateOfBirth("");
      setBatchYear("");
    }
  }, [isEdit, selectedStudentData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button onClick={onOpen} className="cursor-pointer">
          Add New Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add New Student"}</DialogTitle>
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
            type="date"
            placeholder="Date of Birth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <Input
            placeholder="Batch Year"
            value={batchYear}
            onChange={(e) => setBatchYear(e.target.value)}
          />
          <div className="w-full flex justify-end">
            <Button className="cursor-pointer" onClick={handleAddStudent}>
              {isEdit ? "Update" : "Add Student"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAddUserDialog;
