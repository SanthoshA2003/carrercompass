import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Save,
  RotateCcw,
  MapPin,
  Mail,
  Phone,
  Globe,
  UserRound,
  GraduationCap,
  CalendarDays,
  BadgeCheck,
  Search,
  Pencil,
  MoreVertical,
  Eye,
  X,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/services/api";

import Shell from "@/features/skillhub/components/Shell";
import { toast } from "sonner";


const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 ${
      props.className || ""
    }`}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={`w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 ${
      props.className || ""
    }`}
  />
);

const Area = (props) => (
  <textarea
    {...props}
    className={`w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 ${
      props.className || ""
    }`}
  />
);

const Label = ({ children, required = false }) => (
  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
    {children}
    {required && <span className="ml-1 text-rose-400">*</span>}
  </label>
);

const Section = ({ title, description, icon: Icon, children }) => (
  <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 shadow-xl shadow-black/5 sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-cyan-400/20">
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
    </div>

    {children}
  </section>
);

const initialForm = {
  collegeName: "",
  collegeCode: "",
  collegeType: "",
  affiliation: "",
  accreditation: "",
  establishedYear: "",
  website: "",
  email: "",
  phone: "",
  principalName: "",
  contactPerson: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  description: "",
  status: "active",
};

export default function CollegeManagement() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCollegeId, setEditingCollegeId] = useState(null);
  const [menuCollegeId, setMenuCollegeId] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);

  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

 useEffect(() => {
  const handleClickOutside = (event) => {
    const clickedMenu = event.target.closest("[data-college-menu]");

    if (!clickedMenu) {
      setMenuCollegeId(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const validateForm = () => {
    if (!form.collegeName.trim()) {
      toast.error("College name is required");
      return false;
    }

    if (!form.collegeCode.trim()) {
      toast.error("College code is required");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("College email is required");
      return false;
    }

    if (!form.phone.trim()) {
      toast.error("College phone number is required");
      return false;
    }

    if (!form.address.trim()) {
      toast.error("College address is required");
      return false;
    }

    if (!form.city.trim()) {
      toast.error("City is required");
      return false;
    }

    if (!form.state.trim()) {
      toast.error("State is required");
      return false;
    }

    if (!form.pincode.trim()) {
      toast.error("Pincode is required");
      return false;
    }

    return true;
  };

  const handleEditCollege = (college) => {
    setEditingCollegeId(college.id);

    setForm({
      collegeName: college.name || "",
      collegeCode: college.code || "",
      collegeType: college.college_type
        ? college.college_type
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "",
      affiliation: college.university_affiliation || "",
      accreditation: college.accreditation || "",
      establishedYear: college.established_year || "",
      website: college.website || "",
      email: college.email || "",
      phone: college.phone || "",
      principalName: college.principal_dean_name || "",
      contactPerson: college.contact_person || "",
      address: college.address || "",
      city: college.city || "",
      state: college.state || "",
      country: college.country || "India",
      pincode: college.pincode || "",
      description: college.description || "",
      status: college.status || "active",
    });

    setShowForm(true);
  };

  const fetchColleges = async () => {
    try {
      setLoadingColleges(true);

      const response = await api.collegesList();

      console.log("GET COLLEGES RESPONSE:", response);

      // Your API directly returns an array
      setColleges(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
      toast.error("Failed to load colleges");
    } finally {
      setLoadingColleges(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const getCollegeTypeLabel = (type) => {
    if (!type) return "Not specified";

    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

const handleViewCollege = async (college) => {
  // Open modal immediately using the list data
  setSelectedCollege(college);
  setMenuCollegeId(null);

  // Fetch latest details in the background
  try {
    const response = await api.getCollegeById(college.id);

    const latestCollege = response?.data || response;

    if (latestCollege) {
      setSelectedCollege(latestCollege);
    }
  } catch (error) {
    console.error("Failed to fetch latest college details:", error);

    // Modal is already open, so don't show blocking error
    toast.error("Showing available college details");
  }
};
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        name: form.collegeName.trim(),
        code: form.collegeCode.trim().toUpperCase(),
        college_type: form.collegeType ? form.collegeType.toLowerCase() : null,
        established_year: form.establishedYear
          ? Number(form.establishedYear)
          : null,
        university_affiliation: form.affiliation.trim() || null,
        accreditation: form.accreditation.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim(),
        website: form.website.trim() || null,
        principal_dean_name: form.principalName.trim() || null,
        contact_person: form.contactPerson.trim() || null,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        pincode: form.pincode.trim(),
        description: form.description.trim() || null,
        status: form.status,
      };

      console.log("Create college payload:", payload);

      let response;

      if (editingCollegeId) {
        // Update existing college
        response = await api.updateCollege(editingCollegeId, payload);

        console.log("College updated successfully:", response);

        toast.success("College updated successfully");
      } else {
        // Create new college
        response = await api.createCollege(payload);

        console.log("College created successfully:", response);

        toast.success("College created successfully");
      }

      setForm(initialForm);
      setEditingCollegeId(null);

      // Refresh college list after create/update
      await fetchColleges();

      setShowForm(false);
    } catch (error) {
      console.error("❌ Create college error:", error);
      console.error("Error message:", error?.message);
      console.error("Status:", error?.response?.status);
      console.error("Response:", error?.response?.data);

      const errorData = error?.response?.data;

      let message = "Failed to create college";

      if (Array.isArray(errorData?.detail)) {
        message = errorData.detail
          .map((item) => {
            const field = item.loc?.slice(-1)?.[0] || "field";
            return `${field}: ${item.msg}`;
          })
          .join(", ");
      } else if (typeof errorData?.detail === "string") {
        message = errorData.detail;
      } else if (typeof errorData?.message === "string") {
        message = errorData.message;
      } else if (error?.message) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    toast.success("Form reset successfully");
  };

 const filteredColleges = colleges.filter((college) => {
  const searchValue = searchTerm.toLowerCase().trim();

  const collegeName = college.name?.toLowerCase() || "";
  const collegeCode = college.code?.toLowerCase() || "";
  const email = college.email?.toLowerCase() || "";
  const phone = college.phone?.toLowerCase() || "";
  const city = college.city?.toLowerCase() || "";
  const state = college.state?.toLowerCase() || "";
  const address = college.address?.toLowerCase() || "";
  const collegeType = college.college_type?.toLowerCase() || "";

  return (
    collegeName.includes(searchValue) ||
    collegeCode.includes(searchValue) ||
    email.includes(searchValue) ||
    phone.includes(searchValue) ||
    city.includes(searchValue) ||
    state.includes(searchValue) ||
    address.includes(searchValue) ||
    collegeType.includes(searchValue)
  );
});

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-cyan-400">
              <Building2 className="h-4 w-4" />
              College Management
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">
  {showForm
    ? editingCollegeId
      ? "Update College"
      : "Add College"
    : "Colleges"}
</h1>

<p className="mt-2 max-w-2xl text-sm text-slate-400">
  {showForm
    ? editingCollegeId
      ? "Update the selected college information."
      : "Enter the college details to register a new college."
    : "View and manage all registered colleges."}
</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
              <BadgeCheck className="h-4 w-4" />
              College Registration
            </div>

            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Add College
              </button>
            )}

            {showForm && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                  setEditingCollegeId(null);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Colleges
              </button>
            )}
          </div>
        </div>

        {!showForm && (
          <section className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* <div>
    <h2 className="text-xl font-bold text-white">
      Registered Colleges
    </h2>

    <p className="mt-1 text-sm text-slate-400">
      View all colleges registered in the system.
    </p>
  </div> */}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search Field */}
                <div className="relative w-full sm:w-[450px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, code, email, phone, location..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </div>

                {/* College Count */}
                <div className="whitespace-nowrap rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300">
                  {filteredColleges.length} Colleges
                </div>
              </div>
            </div>

            {loadingColleges ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-slate-400">Loading colleges...</p>
              </div>
            ) : filteredColleges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
                <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-500" />

                <h3 className="text-lg font-bold text-white">
                  {colleges.length === 0
                    ? "No colleges found"
                    : "No matching colleges"}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {colleges.length === 0
                    ? "Click Create College to add your first college."
                    : "Try searching with a different college name or code."}
                </p>

                {searchTerm && colleges.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="mt-4 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-visible rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg shadow-black/5">
  {/* Desktop Header */}
  <div className="hidden grid-cols-[110px_minmax(300px,1.9fr)_minmax(180px,1fr)_150px_minmax(140px,1fr)_60px] gap-4 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
  <div>College Code</div>
  <div>College Name</div>
  <div>Email</div>
  <div>Phone Number</div>
  <div>Location</div>
  <div className="text-center">Action</div>
</div>

  {filteredColleges.map((college) => (
    <div
      key={college.id}
      className="relative border-b border-white/10 px-5 py-4 last:border-b-0 transition hover:bg-white/[0.04]"
    >
      {/* Desktop List Row */}
      <div className="hidden grid-cols-[110px_minmax(300px,1.9fr)_minmax(180px,1fr)_150px_minmax(140px,1fr)_60px] items-center gap-4 md:grid">
        {/* College Code */}
        <div>
          <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
            {college.code}
          </span>
        </div>

        {/* College Name */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-cyan-400/20">
            <Building2 className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {college.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {getCollegeTypeLabel(college.college_type)}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-300">
            {college.email || "Not available"}
          </p>
        </div>

        {/* Phone */}
        <div>
          <p className="text-sm text-slate-300">
            {college.phone || "Not available"}
          </p>
        </div>

        {/* Location */}
<div className="min-w-0">
  <div className="flex items-start gap-2 text-sm text-slate-300">
    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

    <span className="truncate">
      {[college.city, college.state]
        .filter(Boolean)
        .join(", ") || "Not available"}
    </span>
  </div>
</div>

        {/* Three Dot Menu */}
       <div
  data-college-menu={college.id}
  className="relative flex justify-center"
>
  <button
    type="button"
    onClick={() => {
      setMenuCollegeId((prev) =>
        prev === college.id ? null : college.id
      );
    }}
    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
    aria-label="College actions"
  >
    <MoreVertical className="h-5 w-5" />
  </button>

  {menuCollegeId === college.id && (
    <div className="absolute right-0 top-11 z-30 w-36 rounded-xl border border-white/10 bg-slate-900 p-1 shadow-2xl">
      <button
        type="button"
        onClick={() => {
          setMenuCollegeId(null);
          handleViewCollege(college);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <Eye className="h-4 w-4" />
        View
      </button>

      <button
        type="button"
        onClick={() => {
          setMenuCollegeId(null);
          handleEditCollege(college);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </button>
    </div>
  )}
</div>
      </div>

      {/* Mobile List Row */}
      <div className="flex items-start gap-3 md:hidden">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-cyan-400/20">
          <Building2 className="h-5 w-5 text-cyan-400" />
        </div>

        <div
  data-college-menu={college.id}
  className="min-w-0 flex-1"
>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {college.name}
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-cyan-400">
                {college.code}
              </p>
                <p className="mt-1 text-xs text-slate-500">
    {college.description || "No description available"}
  </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMenuCollegeId(
                  menuCollegeId === college.id ? null : college.id
                )
              }
              className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="College actions"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-2 break-all text-sm text-slate-400">
            {college.email || "No email"}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {college.phone || "No phone number"}
          </p>

          <p className="mt-1 flex items-start gap-2 text-sm text-slate-400">
  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

  <span>
    {[college.city, college.state]
      .filter(Boolean)
      .join(", ") || "No location"}
  </span>
</p>

          {menuCollegeId === college.id && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleViewCollege(college)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <Eye className="h-4 w-4" />
                View
              </button>

              <button
                type="button"
                onClick={() => {
                  handleEditCollege(college);
                  setMenuCollegeId(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  ))}
  {selectedCollege && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
      {/* Modal Header */}
      <div className="flex items-start justify-between border-b border-white/10 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-cyan-400/20">
            <Building2 className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              {selectedCollege.name || "College Details"}
            </h2>

            <p className="mt-1 text-sm text-cyan-400">
              {selectedCollege.code || "No code"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedCollege(null)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close college details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Content */}
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            College Type
          </p>
          <p className="mt-1 text-sm text-white">
            {getCollegeTypeLabel(selectedCollege.college_type)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Status
          </p>
          <span
            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
              selectedCollege.status === "active"
                ? "bg-emerald-400/10 text-emerald-300"
                : selectedCollege.status === "inactive"
                ? "bg-rose-400/10 text-rose-300"
                : "bg-amber-400/10 text-amber-300"
            }`}
          >
            {selectedCollege.status || "Not available"}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            University Affiliation
          </p>
          <p className="mt-1 text-sm text-white">
            {selectedCollege.university_affiliation || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Accreditation
          </p>
          <p className="mt-1 text-sm text-white">
            {selectedCollege.accreditation || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Established Year
          </p>
          <p className="mt-1 text-sm text-white">
            {selectedCollege.established_year || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Principal / Dean
          </p>
          <p className="mt-1 text-sm text-white">
            {selectedCollege.principal_dean_name || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Contact Person
          </p>
          <p className="mt-1 text-sm text-white">
            {selectedCollege.contact_person || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Email
          </p>
          <p className="mt-1 break-all text-sm text-white">
            {selectedCollege.email || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Phone
          </p>
          <p className="mt-1 text-sm text-white">
            {selectedCollege.phone || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Website
          </p>

          {selectedCollege.website ? (
            <a
              href={selectedCollege.website}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-sm text-cyan-400 hover:text-cyan-300"
            >
              {selectedCollege.website}
            </a>
          ) : (
            <p className="mt-1 text-sm text-white">Not available</p>
          )}
        </div>

        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Address
          </p>
          <p className="mt-1 text-sm leading-6 text-white">
            {[
              selectedCollege.address,
              selectedCollege.city,
              selectedCollege.state,
              selectedCollege.country,
              selectedCollege.pincode,
            ]
              .filter(Boolean)
              .join(", ") || "Not available"}
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description
          </p>
          <p className="mt-1 text-sm leading-6 text-white">
            {selectedCollege.description || "No description available"}
          </p>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end border-t border-white/10 p-5">
        <button
          type="button"
          onClick={() => setSelectedCollege(null)}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
</div>
            )}
          </section>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <Section
              title="Basic College Details"
              description="Enter the primary information about the college."
              icon={GraduationCap}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>College Name</Label>
                  <Input
                    value={form.collegeName}
                    onChange={(e) => updateField("collegeName", e.target.value)}
                    placeholder="Example: University College of Engineering"
                  />
                </div>

                <div>
                  <Label required>College Code</Label>
                  <Input
                    value={form.collegeCode}
                    onChange={(e) =>
                      updateField("collegeCode", e.target.value.toUpperCase())
                    }
                    placeholder="Example: UCE001"
                  />
                </div>

                <div>
                  <Label>College Type</Label>
                  <Select
                    value={form.collegeType}
                    onChange={(e) => updateField("collegeType", e.target.value)}
                  >
                    <option value="">Select college type</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Government Aided">Government Aided</option>
                    <option value="Deemed University">Deemed University</option>
                    <option value="Autonomous">Autonomous</option>
                  </Select>
                </div>

                <div>
                  <Label>Established Year</Label>
                  <Input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={form.establishedYear}
                    onChange={(e) =>
                      updateField("establishedYear", e.target.value)
                    }
                    placeholder="Example: 2005"
                  />
                </div>

                <div>
                  <Label>University Affiliation</Label>
                  <Input
                    value={form.affiliation}
                    onChange={(e) => updateField("affiliation", e.target.value)}
                    placeholder="Example: Anna University"
                  />
                </div>

                <div>
                  <Label>Accreditation</Label>
                  <Input
                    value={form.accreditation}
                    onChange={(e) =>
                      updateField("accreditation", e.target.value)
                    }
                    placeholder="Example: NAAC A+, NBA"
                  />
                </div>
              </div>
            </Section>

            {/* Contact Details */}
            <Section
              title="Contact Information"
              description="Add official college communication details."
              icon={Phone}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>College Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="college@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label required>College Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+91 9876543210"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>College Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="url"
                      value={form.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="https://www.college.edu"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Principal / Dean Name</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={form.principalName}
                      onChange={(e) =>
                        updateField("principalName", e.target.value)
                      }
                      placeholder="Enter principal or dean name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={form.contactPerson}
                    onChange={(e) =>
                      updateField("contactPerson", e.target.value)
                    }
                    placeholder="College admin or placement officer"
                  />
                </div>
              </div>
            </Section>

            {/* Address */}
            <Section
              title="College Address"
              description="Provide the complete registered college address."
              icon={MapPin}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label required>Address</Label>
                  <Area
                    rows={3}
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Enter complete college address"
                  />
                </div>

                <div>
                  <Label required>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Example: Chennai"
                  />
                </div>

                <div>
                  <Label required>State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="Example: Tamil Nadu"
                  />
                </div>

                <div>
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="India"
                  />
                </div>

                <div>
                  <Label required>Pincode</Label>
                  <Input
                    value={form.pincode}
                    onChange={(e) => updateField("pincode", e.target.value)}
                    placeholder="Example: 600001"
                    maxLength={6}
                  />
                </div>
              </div>
            </Section>

            {/* Description and Status */}
            <Section
              title="Additional Information"
              description="Add a short description and college status."
              icon={CalendarDays}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label>College Description</Label>
                  <Area
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Write a short description about the college..."
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending Verification</option>
                  </Select>
                </div>
              </div>
            </Section>

            {/* Actions */}
            <div className="flex flex-col justify-end gap-3 border-t border-white/10 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  editingCollegeId ? (
                    "Updating..."
                  ) : (
                    "Saving..."
                  )
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingCollegeId ? "Update College" : "Save College"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Shell>
  );
}
