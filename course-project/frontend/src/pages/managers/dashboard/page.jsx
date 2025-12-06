import { Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import { useAuth } from "../../../contexts/AuthContext.jsx";

function CheckVerified({ boolean, trueMessage, falseMessage }) {
  return boolean ? (
    <h3 className="inline-block bg-green-200 rounded-lg p-2">{trueMessage}</h3>
  ) : (
    <h3 className="inline-block bg-red-200 rounded-lg p-2">{falseMessage}</h3>
  );
}

export default function ManagerDashboardPage() {
  const { user, logout } = useAuth();
  const { page, setPage } = useContext(PageContext);
  const navigate = useNavigate();
  return (
    <div>
      <main>
        <Outlet />
        <div className="flex justify-center items-center mt-20">
          <div className="grid grid-cols-2 p-4 w-[90%]">
            <div className="flex flex-col p-4">
              {user ? (
                <>
                  <div className="flex flex-col w-full border-2 border-gray-300 rounded-md p-4 flex-1">
                    <p className="text-3xl font-bold text-center">Welcome, {user.name}</p>
                    <hr class="mt-2 h-1 bg-gray-300" />
                    <div class="py-4 gap-20 grid grid-cols-3 text-xl">
                      <dt class="font-medium text-gray-500">UTORid</dt>
                      <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{user.utorid}</dd>
                    </div>
                    <hr class="h-0.5 bg-gray-300" />
                    <div class="py-4 gap-20 grid grid-cols-3 text-xl">
                      <dt class="font-medium text-gray-500">Email</dt>
                      <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                    </div>
                    <hr class="h-0.5 bg-gray-300" />
                    <div class="py-4 gap-20 grid grid-cols-3 text-xl">
                      <dt class="font-medium text-gray-500">Role</dt>
                      <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{user.role}</dd>
                    </div>
                    <hr class="h-0.5 bg-gray-300" />
                    <div class="py-4 gap-20 grid grid-cols-3 text-xl">
                      <dt class="font-medium text-gray-500 pt-2">Verified</dt>
                      <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                        <CheckVerified
                          boolean={user.verified}
                          trueMessage="Verified"
                          falseMessage="Unverified"
                        />
                      </dd>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center w-full mt-2 border-2 border-gray-300 rounded-md p-4">
                    <p className="text-3xl font-bold">Points</p>
                    <p className="text-8xl">{user.points}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-md p-4">
                  <p className="text-lg">Loading user information...</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="flex flex-col text-xl w-full gap-2">
                <a
                  className="flex flex-col border-2 rounded-md p-6 w-full hover:bg-neutral-100"
                  href="/managers/display-users"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="font-bold text-3xl">Users</h1>
                      <h3 className="text-s">View and edit user's information</h3>
                    </div>
                    <div>
                      <div className="ml-4 shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7">
                          </path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>

                <a
                  className="flex flex-col border-2 rounded-md p-6 w-full hover:bg-neutral-100"
                  href="/managers/display-transactions"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="font-bold text-3xl">Transactions</h1>
                      <h3 className="text-s">View and adjust transactions</h3>
                    </div>
                    <div>
                      <div className="ml-4 shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7">
                          </path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>

                <a
                  className="flex flex-col border-2 rounded-md p-6 w-full hover:bg-neutral-100"
                  href="/managers/display-promotions"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="font-bold text-3xl">Promotions</h1>
                      <h3 className="text-s">Create, view, edit, delete promotions</h3>
                    </div>
                    <div>
                      <div className="ml-4 shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7">
                          </path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>

                <a
                  className="flex flex-col border-2 rounded-md p-6 w-full hover:bg-neutral-100"
                  href="/managers/display-events"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="font-bold text-3xl">Events</h1>
                      <h3 className="text-s">Create, view, edit, delete events</h3>
                    </div>
                    <div>
                      <div className="ml-4 shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7">
                          </path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}