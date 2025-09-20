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
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import { Loader } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useState } from "react";

const requiredHeaders = [
  "name",
  "email",
  "phoneNumber",
  "dateOfBirth",
  "batchYear",
];

const studentTableFieldHeaders = [
  "name",
  "email",
  "phoneNumber",
  "dateOfBirth",
  "imageStorageId",
  "batchYear",
];

const AdminBulkAddUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [allCsvHeaders, setAllCsvHeaders] = useState([]);
  const [numberOfStudents, setNumberOfStudents] = useState(0);
  const [mappedCsvColumnWithHeaders, setMappedCsvColumnWithHeaders] = useState(
    []
  );

  const generateUploadStorageUrl = useMutation(api.storage.generateUploadUrl);
  const uploadBulkUploadCountries = useAction(
    api.studentActions.bulkUploadCountries
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    Papa.parse(uploadedFile, {
      header: true,
      complete: (result: any) => {
        const headers = result.meta.fields;
        const data = result.data;

        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header)
        );

        setAllCsvHeaders(headers);

        if (missingHeaders.length > 0) {
          alert("Missing headers");
        } else {
          const validRows = data.filter((row: any) =>
            requiredHeaders.every(
              (header) => row[header] && row[header].trim() !== ""
            )
          );
          setNumberOfStudents(validRows.length);
        }
      },
      error: (err: any) => {
        console.log("Some Error Occured: ", err);
        alert("Some Error Occured processing the bulk uplaod");
      },
    });
  };

  const handleBulkUpload = async () => {
    if (file) {
      setIsBulkUploading(true);
      try {
        const storageId = await storeDocument();

        if (!storageId) {
          console.error("Storage Id not found");
          return;
        }

        // send the storage id to backend on parse and update the database
        await uploadBulkUploadCountries({
          storageId,
          isSkipExisting: true,
          importedMappingData: mappedCsvColumnWithHeaders,
        });

        setIsOpen(false);
      } catch (error) {
        console.log("Error occured: ", error);
      } finally {
        setIsBulkUploading(false);
      }
    }
  };

  const storeDocument = () => {
    return new Promise<undefined | Id<"_storage">>(async (resolve, reject) => {
      try {
        const postUrl = await generateUploadStorageUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file!.type },
          body: file,
        });
        const { storageId } = await result.json();

        resolve(storageId);
      } catch (error) {
        console.error(
          "Error occurred on StoreDocument Function, error: ",
          error
        );
        reject(undefined);
      }
    });
  };

  useEffect(() => {
    if (allCsvHeaders && allCsvHeaders.length > 0) {
      const updatedCsvHeadersData = allCsvHeaders.map((header) => {
        const tableColumnName = studentTableFieldHeaders.find(
          (tableHeader) => tableHeader === header
        );

        return {
          id: header,
          csvColumn: header,
          tableColumn: tableColumnName ? tableColumnName : "",
        };
      });

      setMappedCsvColumnWithHeaders(updatedCsvHeadersData);
    }
  }, [allCsvHeaders]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} className="cursor-pointer">
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input type="file" accept=".csv" onChange={handleFileUpload} />
          {error && <p className="text-red-600">{error}</p>}
          <a
            href="/static/aws-bulk-upload-students-sample.csv"
            download
            className="text-blue-600 underline"
          >
            Download Sample CSV
          </a>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            file && (
              <div className="flex space-x-4">
                <div className="flex-1">
                  <h3 className="font-medium">CSV Columns</h3>
                  <ul>
                    {allCsvHeaders.map((col, index) => (
                      <li key={index}>{col}</li>
                    ))}
                  </ul>
                </div>
                {/* <div className="flex items-center">
                  <span className="text-xl">→</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Map to Fields</h3>
                  <ul>
                    {allCsvHeaders.map((col, index) => (
                      <li key={index}>
                        <select className="border rounded p-1">
                          {studentTableFieldHeaders.map(
                            (header, headerIndex) => (
                              <option key={headerIndex} value={header}>
                                {header}
                              </option>
                            )
                          )}
                        </select>
                      </li>
                    ))}
                  </ul>
                </div> */}
              </div>
            )
          )}
          {file && (
            <Button
              disabled={isBulkUploading}
              onClick={handleBulkUpload}
              className="mt-4"
            >
              Bulk Upload {numberOfStudents} Student
              {numberOfStudents > 1 && "s"}
              {isBulkUploading && (
                <Loader className="transition-all animate-spin" />
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBulkAddUserDialog;
