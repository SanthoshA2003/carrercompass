import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Upload,
  Users,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

import * as XLSX from "xlsx";

import Shell from "../components/Shell";
import { api } from "../../../services/api";

export default function StudentImport() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);

  const [college, setCollege] = useState(null);

  const [loadingCollege, setLoadingCollege] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [generatingCodes, setGeneratingCodes] =
    useState(false);

  const [exporting, setExporting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // GET COLLEGE ID FROM URL
  // ==================================================

  const params = new URLSearchParams(
    window.location.search
  );

  const collegeId = params.get("collegeId");

  // ==================================================
  // LOAD COLLEGE
  // ==================================================

  useEffect(() => {
    const loadCollege = async () => {
      if (!collegeId) {
        setError(
          "College ID is missing from the URL."
        );

        setLoadingCollege(false);
        return;
      }

      try {
        setLoadingCollege(true);
        setError("");

        const response =
          await api.getCollegeById(collegeId);

        console.log(
          "COLLEGE RESPONSE:",
          response
        );

        const collegeData =
          response?.data || response;

        setCollege({
          id:
            collegeData?.id ||
            collegeData?.college_id ||
            collegeId,

          code:
            collegeData?.code ||
            collegeData?.college_code ||
            "COLLEGE",

          name:
            collegeData?.name ||
            collegeData?.college_name ||
            "Selected College",
        });
      } catch (err) {
        console.error(
          "College loading failed:",
          err
        );

        /*
         * Keep the page usable if college details
         * cannot be loaded.
         */
        setCollege({
          id: collegeId,
          code: "COLLEGE",
          name: "Selected College",
        });

        setError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load college details."
        );
      } finally {
        setLoadingCollege(false);
      }
    };

    loadCollege();
  }, [collegeId]);

  // ==================================================
  // DOWNLOAD EXCEL TEMPLATE
  // ==================================================

  const downloadTemplate = () => {
    try {
      setError("");
      setSuccess("");

      const rows = [
        {
          Name: "",
          Email: "",
          Phone: "",
          Department: "",
          Year: "",
        },
      ];

      const worksheet =
        XLSX.utils.json_to_sheet(rows);

      worksheet["!cols"] = [
        { wch: 28 },
        { wch: 32 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
      ];

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
      );

      XLSX.writeFile(
        workbook,
        `${college?.code || "COLLEGE"}_Student_Template.xlsx`
      );

      setSuccess(
        "Excel template downloaded successfully."
      );
    } catch (err) {
      console.error(
        "Template download failed:",
        err
      );

      setError(
        "Unable to create Excel template."
      );
    }
  };

  // ==================================================
  // READ EXCEL FOR PREVIEW
  // ==================================================

  const readExcelFile = (selectedFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = new Uint8Array(
            event.target.result
          );

          const workbook = XLSX.read(data, {
            type: "array",
          });

          if (!workbook.SheetNames.length) {
            reject(
              new Error(
                "The Excel file does not contain a worksheet."
              )
            );
            return;
          }

          const firstSheet =
            workbook.Sheets[
              workbook.SheetNames[0]
            ];

          const rows =
            XLSX.utils.sheet_to_json(
              firstSheet,
              {
                defval: "",
              }
            );

          if (!rows.length) {
            reject(
              new Error(
                "The Excel file is empty."
              )
            );
            return;
          }

          // ------------------------------------------
          // VALIDATE REQUIRED COLUMNS
          // ------------------------------------------

          const firstRow = rows[0];

          const requiredColumns = [
            "Name",
            "Email",
            "Phone",
            "Department",
            "Year",
          ];

          const missingColumns =
            requiredColumns.filter(
              (column) =>
                !Object.prototype.hasOwnProperty.call(
                  firstRow,
                  column
                )
            );

          if (missingColumns.length > 0) {
            reject(
              new Error(
                `Missing columns: ${missingColumns.join(
                  ", "
                )}`
              )
            );
            return;
          }

          // ------------------------------------------
          // CONVERT EXCEL ROWS
          // ------------------------------------------

          const formattedStudents =
            rows
              .map((row, index) => ({
                id: index + 1,

                name: String(
                  row["Name"] ?? ""
                ).trim(),

                email: String(
                  row["Email"] ?? ""
                ).trim(),

                phone: String(
                  row["Phone"] ?? ""
                ).trim(),

                department: String(
                  row["Department"] ?? ""
                ).trim(),

                year: String(
                  row["Year"] ?? ""
                ).trim(),

                student_code: "",
              }))
              .filter(
                (student) =>
                  student.name ||
                  student.email ||
                  student.phone ||
                  student.department ||
                  student.year
              );

          if (!formattedStudents.length) {
            reject(
              new Error(
                "No student data was found in the Excel file."
              )
            );
            return;
          }

          resolve(formattedStudents);
        } catch (err) {
          reject(
            new Error(
              "Unable to read the Excel file."
            )
          );
        }
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the selected file."
          )
        );
      };

      reader.readAsArrayBuffer(
        selectedFile
      );
    });
  };

  // ==================================================
  // CHOOSE + UPLOAD EXCEL TO BACKEND
  // ==================================================

  const handleFileChange = async (event) => {
  setError("");
  setSuccess("");

  const selectedFile =
    event.target.files?.[0];

  if (!selectedFile) {
    return;
  }

  const fileName =
    selectedFile.name.toLowerCase();

  if (
    !fileName.endsWith(".xlsx") &&
    !fileName.endsWith(".xls")
  ) {
    setError(
      "Please select an Excel file (.xlsx or .xls)."
    );

    event.target.value = "";
    return;
  }

  try {
    setUploading(true);

    // ------------------------------------------
    // LOCAL VALIDATION / PREVIEW
    // ------------------------------------------

    await readExcelFile(selectedFile);

    // ------------------------------------------
    // SEND EXCEL TO BACKEND
    // ------------------------------------------

    const response =
  await api.importStudentsExcel(
    selectedFile,
    collegeId
  );

    console.log(
      "STUDENT IMPORT API RESPONSE:",
      response
    );

    // ------------------------------------------
    // USE BACKEND RESPONSE
    // ------------------------------------------

    const importedStudents =
      response?.students || [];

    setFile(selectedFile);

    setStudents(
      importedStudents.map(
        (student, index) => ({
          id:
            student.id ||
            index + 1,

          name:
            student.name || "",

          email:
            student.email || "",

          phone:
            student.phone || "",

          department:
            student.department || "",

          year:
            student.year || "",

          college_id:
            student.college_id ||
            collegeId,

          student_code:
            student.student_code ||
            "",
        })
      )
    );

    // ------------------------------------------
    // UPDATE COLLEGE FROM BACKEND RESPONSE
    // ------------------------------------------

    if (response?.college) {
      setCollege({
        id:
          response.college.id ||
          collegeId,

        name:
          response.college.name ||
          "Selected College",

        code:
          response.college.code ||
          "COLLEGE",
      });
    }

    // ------------------------------------------
    // SUCCESS
    // ------------------------------------------

    setSuccess(
      response?.message ||
      `${response?.imported_count || importedStudents.length} student(s) imported successfully.`
    );
  } catch (err) {
    console.error(
      "Student Excel import failed:",
      err
    );

    setFile(null);
    setStudents([]);

    // ------------------------------------------
    // SAFE ERROR MESSAGE
    // ------------------------------------------

    const detail =
      err?.response?.data?.detail;

    let errorMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Unable to import the Excel file.";

    if (typeof detail === "string") {
      errorMessage = detail;
    } else if (Array.isArray(detail)) {
      errorMessage = detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return (
            item?.msg ||
            JSON.stringify(item)
          );
        })
        .join(", ");
    } else if (
      detail &&
      typeof detail === "object"
    ) {
      errorMessage =
        detail.msg ||
        detail.message ||
        JSON.stringify(detail);
    }

    setError(errorMessage);
  } finally {
    setUploading(false);
  }
};
  // ==================================================
  // REMOVE FILE
  // ==================================================

  const removeFile = () => {
    setFile(null);
    setStudents([]);

    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==================================================
  // GENERATE STUDENT CODES USING BACKEND
  // ==================================================

  const generateStudentCodes = async () => {
    if (!students.length) {
      setError(
        "Please upload the Excel file first."
      );
      return;
    }

    if (!collegeId) {
      setError(
        "College ID is missing."
      );
      return;
    }

    try {
      setError("");
      setSuccess("");

      setGeneratingCodes(true);

      const response =
        await api.generateStudentCodes(
          collegeId
        );

      console.log(
        "GENERATE CODES API RESPONSE:",
        response
      );

      /*
       * Support common backend response formats.
       */

      const backendStudents =
        response?.students ||
        response?.data?.students ||
        (Array.isArray(response?.data)
          ? response.data
          : null);

      if (Array.isArray(backendStudents)) {
        setStudents((currentStudents) => {
          return currentStudents.map(
            (student, index) => {
              const backendStudent =
                backendStudents[index];

              if (!backendStudent) {
                return student;
              }

              return {
                ...student,
                ...backendStudent,

                name:
                  backendStudent.name ||
                  backendStudent.Name ||
                  student.name,

                email:
                  backendStudent.email ||
                  backendStudent.Email ||
                  student.email,

                phone:
                  backendStudent.phone ||
                  backendStudent.Phone ||
                  student.phone,

                department:
                  backendStudent.department ||
                  backendStudent.Department ||
                  student.department,

                year:
                  backendStudent.year ||
                  backendStudent.Year ||
                  student.year,

                student_code:
                  backendStudent.student_code ||
                  backendStudent.studentCode ||
                  backendStudent.code ||
                  student.student_code ||
                  "",
              };
            }
          );
        });
      }

      setSuccess(
        "Student codes generated successfully."
      );
    } catch (err) {
      console.error(
        "Generate student codes failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to generate student codes."
      );
    } finally {
      setGeneratingCodes(false);
    }
  };

  // ==================================================
  // EXPORT EXCEL FROM BACKEND
  // ==================================================

  const exportStudents = async () => {
    if (!students.length) {
      setError(
        "Please upload the Excel file first."
      );
      return;
    }

    if (!collegeId) {
      setError(
        "College ID is missing."
      );
      return;
    }

    try {
      setError("");
      setSuccess("");

      setExporting(true);

      const blob =
        await api.exportStudentsExcel(
          collegeId
        );

      if (!blob) {
        throw new Error(
          "The server returned an empty Excel file."
        );
      }

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download =
        `${college?.code || "COLLEGE"}_Students.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        downloadUrl
      );

      setSuccess(
        "Student Excel exported successfully."
      );
    } catch (err) {
      console.error(
        "Student export failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to export student Excel."
      );
    } finally {
      setExporting(false);
    }
  };

  // ==================================================
  // BACK TO COLLEGES
  // ==================================================

  const goBack = () => {
    window.location.href =
      "/skillhub/admin/colleges";
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loadingCollege) {
    return (
      <Shell>
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />

            <span>
              Loading college...
            </span>
          </div>
        </div>
      </Shell>
    );
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-6">

        {/* BACK */}

        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Colleges
        </button>

        {/* HEADER */}

        <div>
          <div className="flex items-center gap-3">

            <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-400/10">
              <Users className="h-6 w-6 text-cyan-400" />
            </div>

            <div>

              <h1 className="text-2xl font-black text-white">
                Add Students
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                {college?.name ||
                  "Selected College"}
              </p>

              <p className="mt-1 text-xs font-bold text-cyan-400">
                College Code:{" "}
                {college?.code ||
                  "COLLEGE"}
              </p>

              <p className="mt-1 max-w-full break-all text-[11px] text-slate-500">
                College ID:{" "}
                {college?.id ||
                  collegeId ||
                  "-"}
              </p>

            </div>

          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3">

            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">

            <p className="text-sm text-emerald-300">
              {success}
            </p>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="text-emerald-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        <div className="space-y-5">

          {/* STEP 1 */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start gap-4">

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cyan-400/10 text-sm font-black text-cyan-400">
                1
              </div>

              <div className="flex-1">

                <h2 className="font-bold text-white">
                  Download Excel Template
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Download the template and
                  fill in the student details.
                </p>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">

                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Excel columns
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {[
                      "Name",
                      "Email",
                      "Phone",
                      "Department",
                      "Year",
                    ].map((column) => (
                      <span
                        key={column}
                        className="rounded-lg bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300"
                      >
                        {column}
                      </span>
                    ))}

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    downloadTemplate
                  }
                  className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <Download className="h-4 w-4" />

                  Download Template
                </button>

              </div>

            </div>

          </section>

          {/* STEP 2 */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start gap-4">

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-400/10 text-sm font-black text-violet-400">
                2
              </div>

              <div className="flex-1">

                <h2 className="font-bold text-white">
                  Import Student Excel
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Upload the completed Excel
                  file to import the students.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}

                    {uploading
                      ? "Uploading..."
                      : "Choose Excel"}

                  </button>

                  {file && (
                    <div className="flex items-center gap-2">

                      <span className="text-sm text-cyan-400">
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={
                          removeFile
                        }
                        className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>

                    </div>
                  )}

                </div>

                {students.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3">

                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                    <span className="text-sm text-emerald-300">
                      {students.length}{" "}
                      student(s) loaded
                      successfully.
                    </span>

                  </div>
                )}

              </div>

            </div>

          </section>

          {/* STEP 3 */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start gap-4">

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-sm font-black text-emerald-400">
                3
              </div>

              <div className="flex-1">

                <h2 className="font-bold text-white">
                  Generate Student Codes & Export
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Student codes are generated
                  by the backend.
                </p>

                <div className="mt-3 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4">

                  <p className="text-xs text-slate-400">
                    Student codes will be
                    generated for this college:
                  </p>

                  <p className="mt-2 font-mono text-sm font-bold text-cyan-400">
                    {college?.code ||
                      "COLLEGE"}
                    -STU-XXXXXX
                  </p>

                </div>

                <div className="mt-4 flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={
                      generateStudentCodes
                    }
                    disabled={
                      !students.length ||
                      generatingCodes
                    }
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    {generatingCodes ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}

                    {generatingCodes
                      ? "Generating..."
                      : "Generate Student Codes"}

                  </button>

                  <button
                    type="button"
                    onClick={
                      exportStudents
                    }
                    disabled={
                      !students.length ||
                      exporting
                    }
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    {exporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}

                    {exporting
                      ? "Exporting..."
                      : "Generate & Export Excel"}

                  </button>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* STUDENT PREVIEW */}

        {students.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

            <div className="border-b border-white/10 p-5">

              <div className="flex items-center gap-2">

                <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                <h2 className="font-bold text-white">
                  Student Preview
                </h2>

              </div>

              <p className="mt-1 text-sm text-slate-400">
                {students.length} student(s)
                loaded from the Excel file.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">

                    <th className="px-5 py-4">
                      #
                    </th>

                    <th className="px-5 py-4">
                      Name
                    </th>

                    <th className="px-5 py-4">
                      Email
                    </th>

                    <th className="px-5 py-4">
                      Phone
                    </th>

                    <th className="px-5 py-4">
                      Department
                    </th>

                    <th className="px-5 py-4">
                      Year
                    </th>

                    <th className="px-5 py-4">
                      Student Code
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {students.map(
                    (
                      student,
                      index
                    ) => (
                      <tr
                        key={
                          student.id ||
                          index
                        }
                        className="border-b border-white/5"
                      >

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-white">
                          {student.name ||
                            student.Name ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {student.email ||
                            student.Email ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {student.phone ||
                            student.Phone ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {student.department ||
                            student.Department ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {student.year ||
                            student.Year ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">

                          {student.student_code ||
                          student.studentCode ||
                          student.code ? (
                            <span className="rounded-lg bg-cyan-400/10 px-3 py-1.5 font-mono text-xs font-bold text-cyan-400">
                              {student.student_code ||
                                student.studentCode ||
                                student.code}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">
                              Not generated
                            </span>
                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>
        )}

      </div>
    </Shell>
  );
}