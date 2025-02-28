import { Routes, Route, useLocation, Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "../../components";
import { NavigationItem } from "../../models/navigation";
import { AppRoutes } from "../../config/routes";
import { CallLogs, ManageUsers } from "./components";
import { CallLogsProvider } from "../../context/CallLogsContext";
import { classNames } from "../../utils/misc";

const PlaceholderPage = () => {
  return (
    <section className="bg-mainContentBg">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-5xl tracking-tight font-extrabold lg:text-5xl text-text dark:text-primary-500">
            Coming soon...
          </h1>
          <p className="mb-4 text-lg font-light text-text dark:text-gray-400">
            We are working on this feature. Check back soon!
          </p>
          <Link
            to={AppRoutes.Default}
            className="inline-flex text-text bg-titleButtonBg hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </section>
  );
};

// Remove relative paths, use AppRoutes constants
const secondaryNavigation: NavigationItem[] = [
  { name: "Users", path: AppRoutes.AdminUsers },
  { name: "Integrations", path: AppRoutes.AdminIntegrations },
  { name: "Notifications", path: AppRoutes.AdminNotifications },
  { name: "Call Logs", path: AppRoutes.AdminCallLogs },
  //   { name: "Teams", path: AppRoutes.AdminTeams },
];

export const AdminPortal = () => {
  const location = useLocation();

  return (
    <div className="bg-mainContentBg h-full py-4 flex flex-col relative">
      {/* <PageHeader title="Admin" /> */}
      <main className="flex-1 overflow-hidden">
        <h1 className="sr-only">Account Settings</h1>

        <header className="border-b border-white/5 sticky">
          {/* Secondary navigation */}
          <nav className="flex overflow-x-auto py-4">
            <ul
              role="list"
              className="flex min-w-full flex-none gap-x-6 px-4 text-sm/6 font-semibold text-gray-400 sm:px-6 lg:px-8"
            >
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path || ""}
                    className={classNames(
                      location.pathname.includes(item.path || "")
                        ? "text-blue-500"
                        : "text-text",
                      " hover:text-blue-300"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Sub-routes */}
        <CallLogsProvider>
          <Routes>
            <Route index element={<ManageUsers />} />
            <Route
              path={AppRoutes.AdminUsers.replace(AppRoutes.Admin + "/", "")}
              element={<ManageUsers />}
            />
            <Route
              path={AppRoutes.AdminIntegrations.replace(
                AppRoutes.Admin + "/",
                ""
              )}
              element={<PlaceholderPage />}
            />
            <Route
              path={AppRoutes.AdminNotifications.replace(
                AppRoutes.Admin + "/",
                ""
              )}
              element={<PlaceholderPage />}
            />

            <Route
              path={AppRoutes.AdminCallLogs.replace(AppRoutes.Admin + "/", "")}
              element={<CallLogs />}
            />

            <Route
              path={AppRoutes.AdminTeams.replace(AppRoutes.Admin + "/", "")}
              element={<PlaceholderPage />}
            />
          </Routes>
        </CallLogsProvider>
      </main>
    </div>
  );
};
