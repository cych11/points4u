import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NavBar() {
    return (
        <div className="w-full p-3 bg-blue-200">
            <div className="flex justify-between text-2xl font-semibold">
                <h1 className="flex items-center justify-center">Loyalty Program</h1>
                <div className="grid auto-cols-max grid-flow-col gap-2">
                    <button className="-1 px-2 rounded-md bg-blue-400">Users</button>
                    <button className="py-1 px-2 rounded-md hover:bg-blue-300">Transactions</button>
                    <button className="py-1 px-2 rounded-md hover:bg-blue-300">Promotions</button>
                    <button className="py-1 px-2 rounded-md hover:bg-blue-300">Events</button>
                    <button className="py-1 px-2 rounded-md hover:bg-blue-300">My Profile</button>
                    <button className="py-1 px-2 rounded-md hover:bg-blue-300">Log Out</button>
                </div>
            </div>
        </div>
    )
}

function DataTable() {
  const [data, setData] = useState([]); // state to hold the fetched data
  const [loading, setLoading] = useState(true); // state to show loading
  const [error, setError] = useState(null); // state to handle errors

  useEffect(() => {
    // Fetch data from your API
    fetch("http://localhost:3000/users") // replace with your API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []); // empty dependency array = run once on mount

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {data.length > 0 &&
            Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, i) => (
              <td key={i}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ManagerUsers() {
    return (
        <div className="flex items-center justify-center">
            <NavBar></NavBar>
            <DataTable></DataTable>
        </div>
        
    )
}