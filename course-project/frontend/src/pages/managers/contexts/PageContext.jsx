import { createContext, useState } from "react";

const PageContext = createContext();

function PageProvider({ children }) {
  const [page, setPage] = useState('create-events');
  return (
    <PageContext.Provider value={{ page, setPage }}>
      {children}
    </PageContext.Provider>
  );
}

export { PageProvider, PageContext }