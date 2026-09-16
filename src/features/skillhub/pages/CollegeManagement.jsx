import { useState } from "react";
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
} from "lucide-react";

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

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      /*
       * Connect your backend API here.
       *
       * Example:
       *
       * await api.createCollege(form);
       *
       * The API method should be added in:
       * src/services/api.js
       */

      console.log("College details:", form);

      toast.success("College details are ready to be submitted");

      // Remove this reset if you want to keep the entered values.
      // setForm(initialForm);
    } catch (error) {
      console.error("Create college error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save college details"
      );
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    toast.success("Form reset successfully");
  };

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
              Add College
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Add and manage college information for students, courses and
              learning programs.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            College Registration
          </div>
        </div>

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
                  onChange={(e) =>
                    updateField("collegeName", e.target.value)
                  }
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
                  onChange={(e) =>
                    updateField("collegeType", e.target.value)
                  }
                >
                  <option value="">Select college type</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Government Aided">
                    Government Aided
                  </option>
                  <option value="Deemed University">
                    Deemed University
                  </option>
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
                  onChange={(e) =>
                    updateField("affiliation", e.target.value)
                  }
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
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
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
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save College
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}