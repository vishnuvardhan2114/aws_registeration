"use node";

import { parse } from "@fast-csv/parse";
import { ConvexError, v } from "convex/values";
import { Readable } from "stream";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

// Validate .csv file
export const bulkUploadCountries = action({
  args: {
    storageId: v.id("_storage"),
    isSkipExisting: v.boolean(),
    importedMappingData: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      const csvFile = await ctx.storage.get(args.storageId);
      const csvData: any = [];

      if (!csvFile) {
        throw new ConvexError({
          message: "CSV file does not exist on Convex storage",
        });
      }

      const csvBlob = new Blob([csvFile], { type: "text/csv" });
      const arrayBuffer = await csvBlob.arrayBuffer(); // Await the promise instead of using .then()
      const csvString = new TextDecoder().decode(arrayBuffer);
      const stream = Readable.from([csvString]);

      const parsePromise = new Promise((resolve, reject) => {
        const parser = parse({ headers: true })
          .on("error", (error) => {
            reject(error);
          })
          .on("data", (row) => {
            csvData.push(row);
          })
          .on("end", (rowCount: number) => {
            resolve(rowCount);
          });

        stream.pipe(parser);
      });

      await parsePromise
        .then(async (_) => {
          for (const row of csvData) {
            const studentData = {
              name: "",
              email: "",
              phoneNumber: "",
              dateOfBirth: "",
              imageStorageId: undefined,
              batchYear: 0,
            };
            for (const mapping of args.importedMappingData) {
              const { csvColumn, tableColumn } = mapping;
              if (row[csvColumn] !== undefined) {
                studentData[tableColumn] =
                  tableColumn === "batchYear"
                    ? Number(row[csvColumn])
                    : row[csvColumn];
              }
            }
            await ctx.runMutation(api.students.addOrUpdateStudent, studentData);
          }
        })
        .catch((error) => {
          throw new ConvexError({
            message: `CSV file parsing failed, error: ${error}`,
          });
        });
    } catch (error) {
      throw new ConvexError({
        message: `Error occurred on ValidateCsvFile: ${error}`,
      });
    }
  },
});
