import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { PhoneIcon } from "@heroicons/react/24/solid";
import { User, UserRole } from "../../../models/user";
import { useAdmin } from "../../../context/AdminContext";

type UpdateUserFormProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  userToEdit?: User | null;
};

interface FormData {
  firstName: string;
  lastName: string;
  direct_phone_number: string;
  persona: UserRole[];
}

export const UpdateUserForm = ({ open, setOpen, userToEdit }: UpdateUserFormProps) => {
  const { createUser, updateUser } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    direct_phone_number: '',
    persona: []
  });

  // Prefill form when editing
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        firstName: userToEdit.first_name || '',
        lastName: userToEdit.last_name || '',
        direct_phone_number: userToEdit.direct_phone_number || '',
        persona: (userToEdit.persona as UserRole[]) || []
      });
    } else {
      // Reset form when creating new user
      setFormData({
        firstName: '',
        lastName: '',
        direct_phone_number: '',
        persona: []
      });
    }
  }, [userToEdit]);

  const isFormValid = () => {
    return formData.firstName.trim() !== '' && 
           formData.lastName.trim() !== '' && 
           formData.direct_phone_number.trim() !== '' &&
           formData.persona.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (userToEdit) {
        await updateUser(userToEdit.username, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          direct_phone_number: formData.direct_phone_number,
          persona: formData.persona
        });
      } else {
        await createUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          direct_phone_number: formData.direct_phone_number,
          persona: formData.persona
        });
      }
      setOpen(false);
    } catch (error: any) {
      setFormError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonaChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      persona: prev.persona.includes(role) 
        ? prev.persona.filter(r => r !== role)
        : [...prev.persona, role]
    }));
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <div className="fixed inset-0" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <form onSubmit={handleSubmit} className="flex h-full flex-col divide-y divide-gray-200 bg-mainContentBg shadow-xl">
                <div className="h-0 flex-1 overflow-y-auto">
                  <div className="bg-blue-600 px-4 py-6 sm:px-6">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-base font-semibold text-text">
                        {userToEdit ? 'Update User' : 'New User'}
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md bg-blue-600 text-text hover:text-text focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-blue-300">
                        Get started by filling in the information below to
                        create a new user for your application.
                      </p>
                    </div>
                  </div>

                  {formError && (
                    <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-700">
                      {formError}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="divide-y divide-gray-200 px-4 sm:px-6">
                      <div className="space-y-6 pb-5">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                          <div className="sm:col-span-full">
                            <label
                              htmlFor="first-name"
                              className="block text-sm/6 font-medium text-text"
                            >
                              First name *
                            </label>
                            <div className="mt-2">
                              <input
                                required
                                id="first-name"
                                value={formData.firstName}
                                onChange={e => setFormData(prev => ({...prev, firstName: e.target.value}))}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-800 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-full">
                            <label
                              htmlFor="last-name"
                              className="block text-sm/6 font-medium text-text"
                            >
                              Last name *
                            </label>
                            <div className="mt-2">
                              <input
                                required
                                id="last-name"
                                value={formData.lastName}
                                onChange={e => setFormData(prev => ({...prev, lastName: e.target.value}))}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-800 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-full">
                            <label
                              htmlFor="phone"
                              className="block text-sm/6 font-medium text-text"
                            >
                              Phone number *
                            </label>
                            <div className="mt-2 grid grid-cols-1">
                              <input
                                required
                                id="phone"
                                value={formData.direct_phone_number}
                                onChange={e => setFormData(prev => ({...prev, direct_phone_number: e.target.value}))}
                                className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-base text-gray-800 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-slate-900 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:pl-9 sm:text-sm/6"
                              />
                              <PhoneIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-500 sm:size-4"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-full">
                            <fieldset>
                              <legend className="text-sm/6 font-semibold text-text">
                                Persona *
                              </legend>
                              <div className="mt-6 space-y-6">
                                {Object.values(UserRole).map(role => (
                                  <div key={role} className="flex gap-3">
                                    <div className="flex h-6 shrink-0 items-center">
                                      <input
                                        type="checkbox"
                                        id={role}
                                        checked={formData.persona.includes(role)}
                                        onChange={() => handlePersonaChange(role)}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                    </div>
                                    <div className="text-sm/6">
                                      <label htmlFor={role} className="font-medium text-text">
                                        {role}
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </fieldset>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 justify-end gap-x-3 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-text shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : (userToEdit ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
