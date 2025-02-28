import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { classNames } from "../../../utils";
import { useAdmin } from "../../../context/AdminContext";
import ElevatedLoader from "../../../components/ElevatedLoader";
import { UpdateUserForm } from "./UpdateUserForm";
import { User } from "../../../models/user";

const statusColors = {
  admin: "text-blue-700 bg-blue-50 ring-blue-600/20",
  manager: "text-purple-700 bg-purple-50 ring-purple-600/20",
  loan_officer: "text-green-700 bg-green-50 ring-green-600/20",
  processing: "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
  jr_loan_officer: "text-orange-700 bg-orange-50 ring-orange-600/20",
};

export const ManageUsers = () => {
  const { users, loading, error, loadUsers } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("Loading users");
    loadUsers();
  }, [loadUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <ElevatedLoader width="15rem" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        Error: {error}
      </div>
    );
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  return (
    <>
      <UpdateUserForm
        open={showModal}
        setOpen={setShowModal}
        userToEdit={selectedUser}
      />
      <div className="h-full py-10 mx-auto px-4 sm:px-1 lg:px-8 mb-10 overflow-y-auto">
        <div className="">
          <div className="text-center">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
              aria-hidden="true"
              className="mx-auto size-12 text-text"
            >
              <path
                d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="mt-2 text-lg font-semibold text-text">
              Manage Users
            </h2>
            <p className="mt-1 text-sm text-text">
              Add or edit users to your application
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="border-b border-gray-200 pb-6 sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-text">Users</h3>
            <div className="mt-3 sm:ml-4 sm:mt-0">
              <button
                type="button"
                onClick={() => handleCreateUser()}
                className="inline-flex items-center rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-text shadow-sm hover:bg-orange-500/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create new user
              </button>
            </div>
          </div>
        </div>
        <ul role="list" className="divide-y divide-gray-100">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between gap-x-6 py-5"
            >
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm/6 font-semibold text-text capitalize">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.persona?.map((role) => (
                    <p
                      key={role}
                      className={classNames(
                        statusColors[role as keyof typeof statusColors] ||
                          "text-gray-700 bg-gray-50 ring-gray-600/20",
                        "mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                      )}
                    >
                      {role}
                    </p>
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
                  <p className="truncate">{user.username}</p>
                  <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <p className="truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <button
                  onClick={() => handleEditUser(user)}
                  className="hidden rounded-md bg-blue-500 px-2.5 py-1.5 text-sm font-semibold text-text shadow-sm hover:bg-blue-400 sm:block"
                >
                  Edit User
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
